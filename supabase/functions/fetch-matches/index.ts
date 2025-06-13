
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('fetch-matches function started')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { date, competitionId } = await req.json()
    console.log(`Fetching matches for date: ${date}, competition: ${competitionId}`)

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('matches_cache')
      .select('match_data, expires_at')
      .eq('date', date)
      .eq('competition_id', competitionId)
      .maybeSingle()

    if (cacheError) {
      console.error('Cache query error:', cacheError)
    } else if (cachedData && new Date(cachedData.expires_at) > new Date()) {
      console.log('Serving from cache')
      return new Response(
        JSON.stringify({ data: cachedData.match_data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch from API-Football
    const apiKey = Deno.env.get('API_FOOTBALL_KEY')
    if (!apiKey) {
      console.error('API_FOOTBALL_KEY not configured')
      throw new Error('API_FOOTBALL_KEY not configured')
    }

    const currentYear = new Date().getFullYear()
    const apiUrl = `https://v3.football.api-sports.io/fixtures?date=${date}&league=${competitionId}&season=${currentYear}`
    console.log(`Fetching from API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        'X-RapidAPI-Host': 'v3.football.api-sports.io',
        'X-RapidAPI-Key': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('API error response:', errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const apiData = await response.json()
    console.log(`API returned ${apiData.response?.length || 0} matches`)

    // Cache the result
    const { error: insertError } = await supabaseClient
      .from('matches_cache')
      .upsert({
        date,
        competition_id: competitionId,
        match_data: apiData,
      })

    if (insertError) {
      console.error('Cache insert error:', insertError)
      // Continue even if caching fails
    } else {
      console.log('Successfully cached match data')
    }

    return new Response(
      JSON.stringify({ data: apiData, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-matches:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
