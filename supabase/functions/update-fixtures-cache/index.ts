
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// Competition mapping for major leagues
const COMPETITIONS = {
  PREMIER_LEAGUE: 39,
  CHAMPIONSHIP: 40,
  LEAGUE_ONE: 41,
  LEAGUE_TWO: 42,
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  FA_CUP: 45,
  CARABAO_CUP: 48
}

// Channel mapping for better matching
const CHANNEL_MAPPING: Record<string, { name: string; logo: string }> = {
  'sky sports premier league': {
    name: 'SKY SPORTS PREMIER LEAGUE',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'sky sports football': {
    name: 'SKY SPORTS FOOTBALL',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'sky sports main event': {
    name: 'SKY SPORTS MAIN EVENT', 
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'bt sport 1': {
    name: 'BT SPORT 1',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/BT-Sport-Logo.png'
  },
  'bt sport 2': {
    name: 'BT SPORT 2',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/BT-Sport-Logo.png'
  },
  'bt sport 3': {
    name: 'BT SPORT 3',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/BT-Sport-Logo.png'
  },
  'tnt sports 1': {
    name: 'TNT SPORTS 1',
    logo: 'https://logos-world.net/wp-content/uploads/2023/07/TNT-Sports-Logo.png'
  },
  'tnt sports 2': {
    name: 'TNT SPORTS 2',
    logo: 'https://logos-world.net/wp-content/uploads/2023/07/TNT-Sports-Logo.png'
  },
  'amazon prime': {
    name: 'AMAZON PRIME VIDEO',
    logo: 'https://logos-world.net/wp-content/uploads/2021/03/Amazon-Prime-Video-Logo.png'
  },
  'bbc one': {
    name: 'BBC ONE',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/BBC-One-Logo.png'
  },
  'itv': {
    name: 'ITV',
    logo: 'https://logos-world.net/wp-content/uploads/2021/03/ITV-Logo.png'
  }
}

function getChannelInfo(channelName: string): { name: string; logo: string } {
  const normalized = channelName.toLowerCase().trim()
  
  for (const [key, value] of Object.entries(CHANNEL_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }
  
  return {
    name: channelName.toUpperCase(),
    logo: 'https://via.placeholder.com/100x50?text=TV'
  }
}

async function updateCacheForDate(date: string, supabaseClient: any): Promise<number> {
  console.log(`🔄 Updating cache for date: ${date}`)
  
  try {
    // Check if we already have fresh cache for this date
    const { data: existingCache } = await supabaseClient
      .from('matches_cache')
      .select('*')
      .eq('date', date)
      .eq('competition_id', COMPETITIONS.PREMIER_LEAGUE)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingCache) {
      console.log(`✅ Fresh cache already exists for ${date}`)
      return (existingCache.match_data as any[]).length
    }

    // Fetch Premier League matches using the scraper
    console.log(`🏆 Fetching Premier League matches for ${date}`)
    
    const response = await supabaseClient.functions.invoke('scrape-premier-league', {
      body: { date }
    })

    if (response.error) {
      console.error(`❌ Error fetching matches for ${date}:`, response.error)
      return 0
    }

    const fixtures = response.data?.data?.response || []
    console.log(`📊 Got ${fixtures.length} fixtures for ${date}`)
    
    if (fixtures.length === 0) {
      // Still cache empty results to avoid repeated scraping
      const emptyMatches: any[] = []
      
      await supabaseClient
        .from('matches_cache')
        .upsert({
          date,
          competition_id: COMPETITIONS.PREMIER_LEAGUE,
          match_data: emptyMatches,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }, {
          onConflict: 'date,competition_id'
        })
      
      return 0
    }

    // Transform and cache the matches
    const transformedMatches = fixtures.map((fixture: any, index: number) => ({
      id: fixture.id || `pl-${date}-${index}`,
      homeTeam: {
        name: fixture.homeTeam.name,
        crest: fixture.homeTeam.crest
      },
      awayTeam: {
        name: fixture.awayTeam.name,
        crest: fixture.awayTeam.crest
      },
      kickoffTime: fixture.kickoffTime,
      date: fixture.date,
      channel: getChannelInfo('Sky Sports Premier League'),
      isLive: fixture.status === 'LIVE',
      competition: 'Premier League',
      tvMatch: null
    }))

    // Cache the results
    await supabaseClient
      .from('matches_cache')
      .upsert({
        date,
        competition_id: COMPETITIONS.PREMIER_LEAGUE,
        match_data: transformedMatches,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }, {
        onConflict: 'date,competition_id'
      })

    console.log(`✅ Cached ${transformedMatches.length} matches for ${date}`)
    return transformedMatches.length

  } catch (error) {
    console.error(`💥 Error updating cache for ${date}:`, error)
    return 0
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🕐 Daily cache update started at 4AM')
    
    const supabaseUrl = 'https://bxgsfctuzxjhczioymqx.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log(`✅ Supabase client created successfully`)

    // Generate dates for the next 14 days starting from today
    const dates: string[] = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    console.log(`📅 Updating cache for ${dates.length} dates: ${dates[0]} to ${dates[dates.length - 1]}`)

    let totalMatches = 0
    let successfulDates = 0

    // Update cache for each date
    for (const date of dates) {
      try {
        const matchCount = await updateCacheForDate(date, supabaseClient)
        totalMatches += matchCount
        successfulDates++
        
        if (matchCount > 0) {
          console.log(`📊 Date ${date}: ${matchCount} matches cached`)
        }
        
        // Add small delay between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`⚠️ Failed to update cache for ${date}:`, error)
      }
    }

    console.log(`🎯 Cache update completed: ${totalMatches} total matches across ${successfulDates}/${dates.length} dates`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Cache updated successfully`,
        stats: {
          datesProcessed: successfulDates,
          totalDates: dates.length,
          totalMatches,
          dateRange: `${dates[0]} to ${dates[dates.length - 1]}`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in cache update function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
