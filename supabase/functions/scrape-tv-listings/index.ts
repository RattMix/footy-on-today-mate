
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('scrape-tv-listings function started')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { date } = await req.json()
    console.log(`Scraping TV listings for date: ${date}`)

    // Check cache first (1 hour expiry)
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('tv_listings_cache')
      .select('listings_data, expires_at')
      .eq('date', date)
      .maybeSingle()

    if (cacheError) {
      console.error('Cache query error:', cacheError)
    } else if (cachedData && new Date(cachedData.expires_at) > new Date()) {
      console.log('Serving TV listings from cache')
      return new Response(
        JSON.stringify({ data: cachedData.listings_data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Scrape from livesportontv.com
    const scrapeUrl = `https://www.livesportontv.com/sport/football/`
    console.log(`Scraping from: ${scrapeUrl}`)

    const response = await fetch(scrapeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      console.error(`Scraping failed: ${response.status} ${response.statusText}`)
      throw new Error(`Scraping failed: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    const listings: any[] = []
    
    // Parse the HTML structure to extract TV listings
    const matchRows = doc.querySelectorAll('tr.match-row, .fixture-row, .listing-row')
    
    matchRows.forEach((row: any) => {
      try {
        const timeElement = row.querySelector('.time, .kick-off, .match-time')
        const teamsElement = row.querySelector('.teams, .match-teams, .fixture')
        const channelElement = row.querySelector('.channel, .tv-channel, .broadcaster')

        if (timeElement && teamsElement && channelElement) {
          const time = timeElement.textContent?.trim()
          const teams = teamsElement.textContent?.trim()
          const channel = channelElement.textContent?.trim()

          if (time && teams && channel) {
            listings.push({
              time,
              teams,
              channel,
              originalChannel: channel,
              scrapedAt: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.warn('Error parsing row:', error)
      }
    })

    console.log(`Scraped ${listings.length} TV listings`)

    const scrapedData = {
      date,
      listings,
      scrapedAt: new Date().toISOString(),
      source: 'livesportontv.com'
    }

    // Cache the result
    const { error: insertError } = await supabaseClient
      .from('tv_listings_cache')
      .upsert({
        date,
        listings_data: scrapedData,
      })

    if (insertError) {
      console.error('Cache insert error:', insertError)
      // Continue even if caching fails
    } else {
      console.log('Successfully cached TV listings')
    }

    return new Response(
      JSON.stringify({ data: scrapedData, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scrape-tv-listings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
