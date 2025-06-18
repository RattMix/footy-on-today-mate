
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
    console.log('🧪 Test fixtures function started')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test August 15th specifically
    const testDate = '2024-08-15'
    console.log(`🎯 Testing fixtures for ${testDate}`)

    // Clear cache first
    await supabaseClient
      .from('matches_cache')
      .delete()
      .eq('date', testDate)
    
    console.log(`🗑️ Cleared cache for ${testDate}`)

    // Test Premier League scraper
    console.log('🔄 Testing Premier League scraper...')
    const plResponse = await supabaseClient.functions.invoke('scrape-premier-league', {
      body: { date: testDate }
    })
    
    console.log('📊 Premier League scraper result:', plResponse)

    // Test main football data function
    console.log('🔄 Testing main football data function...')
    const mainResponse = await supabaseClient.functions.invoke('get-football-data', {
      body: { 
        dateFrom: testDate, 
        dateTo: testDate 
      }
    })
    
    console.log('📊 Main function result:', mainResponse)

    const testResults = {
      date: testDate,
      premierLeagueScraper: {
        success: !plResponse.error,
        error: plResponse.error?.message,
        fixtureCount: plResponse.data?.data?.response?.length || 0,
        fixtures: plResponse.data?.data?.response || []
      },
      mainFunction: {
        success: !mainResponse.error,
        error: mainResponse.error?.message,
        matchCount: mainResponse.data?.matches?.length || 0,
        matches: mainResponse.data?.matches || []
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        testResults,
        message: `🧪 Test completed for ${testDate}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Test function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: '❌ Test failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
