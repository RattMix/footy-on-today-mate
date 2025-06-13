
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  
  // Default fallback
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
    
    // Transform Premier League fixtures to match the expected format
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
      channel: getChannelInfo('Sky Sports Premier League'), // Default channel for Premier League
      isLive: fixture.status === 'LIVE',
      competition: 'Premier League',
      tvMatch: null
    }))

  } catch (error) {
    console.error(`💥 Error fetching Premier League matches for ${date}:`, error)
    return []
  }
}

async function fetchOtherCompetitionMatches(date: string, competitionId: number, supabaseClient: any): Promise<any[]> {
  console.log(`⚽ Fetching matches for competition ${competitionId} on ${date} (using fallback)`)
  
  // For now, return empty array for other competitions since the API is not working
  // In the future, this could be expanded to use other scrapers or APIs
  console.log(`📭 No matches available for competition ${competitionId} (API unavailable)`)
  return []
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 get-football-data function started')
    
    const { dateFrom, dateTo } = await req.json()
    console.log(`📅 Getting football data from ${dateFrom} to ${dateTo}`)

    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const allMatches: any[] = []
    const competitions = Object.values(COMPETITIONS)
    
    // Generate date range
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    const dates: string[] = []
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    console.log(`🔄 Processing ${dates.length} dates and ${competitions.length} competitions`)

    // Fetch matches for each date and competition
    for (const date of dates) {
      console.log(`📆 Processing date: ${date}`)

      // Get TV listings for this date (optional enhancement)
      let tvListings: any[] = []
      try {
        const tvResponse = await supabaseClient.functions.invoke('scrape-tv-listings', {
          body: { date }
        })

        if (!tvResponse.error && tvResponse.data?.data) {
          tvListings = tvResponse.data.data.listings || []
          console.log(`📺 Got ${tvListings.length} TV listings for ${date}`)
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch TV listings for ${date}:`, error)
      }

      // Fetch matches for each competition
      for (const competitionId of competitions) {
        try {
          let matches: any[] = []

          // Use Premier League scraper for Premier League matches
          if (competitionId === COMPETITIONS.PREMIER_LEAGUE) {
            matches = await fetchPremierLeagueMatches(date, supabaseClient)
          } else {
            // For other competitions, use fallback (empty for now)
            matches = await fetchOtherCompetitionMatches(date, competitionId, supabaseClient)
          }

          // Add matches to the result
          allMatches.push(...matches)
          
          if (matches.length > 0) {
            console.log(`✅ Added ${matches.length} matches for ${date}, competition ${competitionId}`)
          }

        } catch (error) {
          console.warn(`⚠️ Error fetching matches for ${date}, competition ${competitionId}:`, error)
        }
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
        message: `✅ Successfully fetched ${allMatches.length} matches`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in get-football-data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
