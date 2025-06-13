
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

async function fetchPremierLeagueMatches(date: string, supabaseClient: any): Promise<any[]> {
  console.log(`🏆 Fetching Premier League matches for ${date} using scrape-premier-league`)
  
  try {
    const response = await supabaseClient.functions.invoke('scrape-premier-league', {
      body: { date }
    })

    console.log(`📊 Premier League scraper response:`, response)

    if (response.error) {
      console.error(`❌ Premier League scraper error:`, response.error)
      return []
    }

    if (!response.data?.data?.response) {
      console.warn(`⚠️ No Premier League data returned for ${date}`)
      return []
    }

    const fixtures = response.data.data.response
    console.log(`✅ Got ${fixtures.length} Premier League fixtures for ${date}`)
    
    return fixtures.map((fixture: any, index: number) => ({
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

  } catch (error) {
    console.error(`💥 Error fetching Premier League matches for ${date}:`, error)
    return []
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 get-football-data function started')
    console.log(`📋 Request method: ${req.method}`)
    console.log(`📋 Request headers:`, Object.fromEntries(req.headers.entries()))
    
    let requestBody
    try {
      requestBody = await req.json()
      console.log(`📋 Request body:`, requestBody)
    } catch (error) {
      console.error('❌ Failed to parse request body:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          matches: [],
          count: 0,
          message: '❌ Failed to parse request'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { dateFrom, dateTo } = requestBody
    console.log(`📅 Getting football data from ${dateFrom} to ${dateTo}`)

    const supabaseUrl = 'https://bxgsfctuzxjhczioymqx.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found')
      return new Response(
        JSON.stringify({ 
          error: 'Service configuration error',
          matches: [],
          count: 0,
          message: '❌ Service configuration error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log(`✅ Supabase client created successfully`)

    const allMatches: any[] = []
    
    // Generate date range
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    const dates: string[] = []
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    console.log(`🔄 Processing ${dates.length} dates`)

    // Only fetch Premier League matches for now
    for (const date of dates) {
      console.log(`📆 Processing date: ${date}`)

      try {
        const matches = await fetchPremierLeagueMatches(date, supabaseClient)
        allMatches.push(...matches)
        
        if (matches.length > 0) {
          console.log(`✅ Added ${matches.length} matches for ${date}`)
        } else {
          console.log(`📭 No matches found for ${date}`)
        }

      } catch (error) {
        console.warn(`⚠️ Error fetching matches for ${date}:`, error)
      }
    }

    // Sort matches by date and time
    allMatches.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.kickoffTime}`)
      const dateB = new Date(`${b.date} ${b.kickoffTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    console.log(`🎯 Returning ${allMatches.length} total matches`)

    return new Response(
      JSON.stringify({ 
        matches: allMatches, 
        count: allMatches.length,
        message: allMatches.length > 0 
          ? `✅ Successfully fetched ${allMatches.length} matches`
          : `📭 No matches found for the requested dates`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in get-football-data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        matches: [],
        count: 0,
        message: '❌ Failed to fetch football data'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
