
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

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/fc$|cf$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyMatch(str1: string, str2: string): number {
  const norm1 = normalizeTeamName(str1)
  const norm2 = normalizeTeamName(str2)
  
  if (norm1 === norm2) return 1.0
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8
  
  // Simple character similarity
  const shorter = norm1.length < norm2.length ? norm1 : norm2
  const longer = norm1.length >= norm2.length ? norm1 : norm2
  
  let matches = 0
  for (const char of shorter) {
    if (longer.includes(char)) matches++
  }
  
  return matches / longer.length
}

function matchTVListing(homeTeam: string, awayTeam: string, listings: any[]): any | null {
  let bestMatch = null
  let bestScore = 0

  for (const listing of listings) {
    const teams = listing.teams?.toLowerCase() || ''
    
    // Try different team name combinations
    const homeScore = fuzzyMatch(homeTeam, teams)
    const awayScore = fuzzyMatch(awayTeam, teams)
    const combinedScore = Math.max(homeScore, awayScore)
    
    if (combinedScore > bestScore && combinedScore > 0.6) {
      bestScore = combinedScore
      bestMatch = listing
    }
  }

  return bestMatch
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dateFrom, dateTo } = await req.json()
    console.log(`Getting football data from ${dateFrom} to ${dateTo}`)

    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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

    // Fetch matches for each date and competition
    for (const date of dates) {
      // Get TV listings for this date
      const tvResponse = await fetch('https://bxgsfctuzxjhczioymqx.supabase.co/functions/v1/scrape-tv-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ date })
      })

      let tvListings: any[] = []
      if (tvResponse.ok) {
        const tvData = await tvResponse.json()
        tvListings = tvData.data?.listings || []
      }

      // Fetch matches for each competition
      for (const competitionId of competitions) {
        try {
          const matchResponse = await fetch('https://bxgsfctuzxjhczioymqx.supabase.co/functions/v1/fetch-matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ date, competitionId })
          })

          if (matchResponse.ok) {
            const matchData = await matchResponse.json()
            const matches = matchData.data?.response || []

            for (const match of matches) {
              const homeTeam = match.teams?.home?.name || ''
              const awayTeam = match.teams?.away?.name || ''
              
              // Try to match with TV listings
              const tvMatch = matchTVListing(homeTeam, awayTeam, tvListings)
              const channelInfo = tvMatch ? getChannelInfo(tvMatch.channel) : getChannelInfo('Sky Sports Premier League')

              const transformedMatch = {
                id: match.fixture?.id?.toString() || `${date}-${competitionId}-${Math.random()}`,
                homeTeam: {
                  name: homeTeam.toUpperCase(),
                  crest: match.teams?.home?.logo || 'https://via.placeholder.com/50'
                },
                awayTeam: {
                  name: awayTeam.toUpperCase(),
                  crest: match.teams?.away?.logo || 'https://via.placeholder.com/50'
                },
                kickoffTime: new Date(match.fixture?.date || '').toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                date: date,
                channel: channelInfo,
                isLive: match.fixture?.status?.short === 'LIVE',
                competition: match.league?.name || 'Unknown',
                tvMatch: tvMatch ? {
                  originalChannel: tvMatch.channel,
                  matchConfidence: 'auto-matched'
                } : null
              }

              allMatches.push(transformedMatch)
            }
          }
        } catch (error) {
          console.warn(`Error fetching matches for ${date}, competition ${competitionId}:`, error)
        }
      }
    }

    // Sort matches by date and time
    allMatches.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.kickoffTime}`)
      const dateB = new Date(`${b.date} ${b.kickoffTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    console.log(`Returning ${allMatches.length} total matches`)

    return new Response(
      JSON.stringify({ matches: allMatches, count: allMatches.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-football-data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
