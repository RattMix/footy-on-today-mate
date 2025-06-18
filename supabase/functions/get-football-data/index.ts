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

async function getMatchesFromCache(date: string, supabaseClient: any): Promise<any[] | null> {
  console.log(`🔍 Checking cache for date: ${date}`)
  
  try {
    const { data: cacheEntry, error } = await supabaseClient
      .from('matches_cache')
      .select('match_data, expires_at')
      .eq('date', date)
      .eq('competition_id', COMPETITIONS.PREMIER_LEAGUE)
      .single()

    if (error) {
      console.log(`📭 No cache found for ${date}:`, error.message)
      return null
    }

    // Check if cache is still valid
    const expiresAt = new Date(cacheEntry.expires_at)
    const now = new Date()
    
    if (expiresAt <= now) {
      console.log(`⏰ Cache expired for ${date} (expired at ${expiresAt.toISOString()})`)
      return null
    }

    console.log(`✅ Fresh cache found for ${date} with ${(cacheEntry.match_data as any[]).length} matches`)
    return cacheEntry.match_data as any[]

  } catch (error) {
    console.warn(`⚠️ Error checking cache for ${date}:`, error)
    return null
  }
}

async function fetchAndCacheMatches(date: string, supabaseClient: any): Promise<any[]> {
  console.log(`🏆 Fetching Premier League matches with channel info for ${date}`)
  
  try {
    // Primary: Get matches with channel info from Premier League scraper
    const response = await supabaseClient.functions.invoke('scrape-premier-league', {
      body: { date }
    })

    console.log(`📊 Premier League scraper response:`, response)

    if (response.error) {
      console.error(`❌ Premier League scraper error:`, response.error)
      return await fetchTVListingsBackup(date, supabaseClient)
    }

    if (!response.data?.data?.response) {
      console.warn(`⚠️ No Premier League data returned for ${date}`)
      return await fetchTVListingsBackup(date, supabaseClient)
    }

    const fixtures = response.data.data.response
    console.log(`✅ Got ${fixtures.length} Premier League fixtures with channel info for ${date}`)
    
    // If we have fixtures but some are missing channel info, enhance with TV listings
    const enhancedFixtures = await enhanceWithTVListings(fixtures, date, supabaseClient)
    
    // Cache the results
    try {
      await supabaseClient
        .from('matches_cache')
        .upsert({
          date,
          competition_id: COMPETITIONS.PREMIER_LEAGUE,
          match_data: enhancedFixtures,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }, {
          onConflict: 'date,competition_id'
        })
      
      console.log(`💾 Cached ${enhancedFixtures.length} enhanced matches for ${date}`)
    } catch (cacheError) {
      console.warn(`⚠️ Failed to cache matches for ${date}:`, cacheError)
    }

    return enhancedFixtures

  } catch (error) {
    console.error(`💥 Error fetching matches for ${date}:`, error)
    return await fetchTVListingsBackup(date, supabaseClient)
  }
}

async function fetchTVListingsBackup(date: string, supabaseClient: any): Promise<any[]> {
  console.log(`🔄 Falling back to TV listings scraper for ${date}`)
  
  try {
    const tvResponse = await supabaseClient.functions.invoke('scrape-tv-listings', {
      body: { date }
    })

    if (tvResponse.error || !tvResponse.data?.data?.listings) {
      console.warn(`⚠️ TV listings backup also failed for ${date}`)
      return []
    }

    const listings = tvResponse.data.data.listings
    console.log(`📺 Got ${listings.length} TV listings for ${date}`)
    
    // Convert TV listings to match format
    const matches = listings
      .filter((listing: any) => listing.teams && listing.channel)
      .map((listing: any, index: number) => {
        const teams = listing.teams.split(' v ')
        if (teams.length !== 2) return null
        
        return {
          id: `tv-${date}-${index}`,
          homeTeam: {
            name: teams[0].trim().toUpperCase(),
            crest: 'https://via.placeholder.com/50x50?text=PL'
          },
          awayTeam: {
            name: teams[1].trim().toUpperCase(),
            crest: 'https://via.placeholder.com/50x50?text=PL'
          },
          kickoffTime: listing.time || '15:00',
          date: date,
          channel: {
            name: listing.channel.toUpperCase(),
            logo: 'https://via.placeholder.com/100x50?text=TV'
          },
          competition: 'Premier League',
          isLive: false
        }
      })
      .filter((match: any) => match !== null)

    console.log(`✅ Converted ${matches.length} TV listings to matches`)
    return matches

  } catch (error) {
    console.error(`💥 TV listings backup failed for ${date}:`, error)
    return []
  }
}

async function enhanceWithTVListings(fixtures: any[], date: string, supabaseClient: any): Promise<any[]> {
  console.log(`🔍 Enhancing ${fixtures.length} fixtures with TV listings data`)
  
  try {
    const tvResponse = await supabaseClient.functions.invoke('scrape-tv-listings', {
      body: { date }
    })

    if (tvResponse.error || !tvResponse.data?.data?.listings) {
      console.log(`📺 No TV listings available for enhancement`)
      return fixtures
    }

    const listings = tvResponse.data.data.listings
    console.log(`📺 Got ${listings.length} TV listings for cross-reference`)
    
    const enhancedFixtures = fixtures.map(fixture => {
      // If fixture already has good channel info, keep it
      if (fixture.channel && fixture.channel.name && fixture.channel.name !== 'TBC') {
        return fixture
      }
      
      // Try to match with TV listings
      const matchingListing = listings.find((listing: any) => {
        if (!listing.teams || !listing.time) return false
        
        const listingTeams = listing.teams.toLowerCase()
        const homeTeam = fixture.homeTeam.name.toLowerCase()
        const awayTeam = fixture.awayTeam.name.toLowerCase()
        
        // Check if both team names appear in the listing
        return listingTeams.includes(homeTeam.substring(0, 8)) && 
               listingTeams.includes(awayTeam.substring(0, 8))
      })
      
      if (matchingListing && matchingListing.channel) {
        console.log(`🎯 Enhanced ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} with channel: ${matchingListing.channel}`)
        return {
          ...fixture,
          channel: {
            name: matchingListing.channel.toUpperCase(),
            logo: getChannelLogo(matchingListing.channel)
          }
        }
      }
      
      return fixture
    })
    
    console.log(`✅ Enhanced fixtures with TV listings data`)
    return enhancedFixtures

  } catch (error) {
    console.warn(`⚠️ Error enhancing with TV listings:`, error)
    return fixtures
  }
}

function getChannelLogo(channelName: string): string {
  const channel = channelName.toLowerCase()
  
  if (channel.includes('sky')) {
    return 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  }
  if (channel.includes('tnt') || channel.includes('bt sport')) {
    return 'https://logos-world.net/wp-content/uploads/2023/07/TNT-Sports-Logo.png'
  }
  if (channel.includes('amazon') || channel.includes('prime')) {
    return 'https://logos-world.net/wp-content/uploads/2021/03/Amazon-Prime-Video-Logo.png'
  }
  if (channel.includes('bbc')) {
    return 'https://logos-world.net/wp-content/uploads/2020/06/BBC-One-Logo.png'
  }
  if (channel.includes('itv')) {
    return 'https://logos-world.net/wp-content/uploads/2021/03/ITV-Logo.png'
  }
  
  return 'https://via.placeholder.com/100x50?text=TV'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Enhanced get-football-data function started')
    console.log(`📋 Request method: ${req.method}`)
    
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
    console.log(`📅 Getting enhanced football data from ${dateFrom} to ${dateTo}`)

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
    
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    const dates: string[] = []
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    console.log(`🔄 Processing ${dates.length} dates for enhanced channel data`)

    for (const date of dates) {
      console.log(`📆 Processing date: ${date}`)

      try {
        let matches = await getMatchesFromCache(date, supabaseClient)
        
        if (matches === null) {
          console.log(`🔄 Cache miss for ${date}, fetching enhanced data`)
          matches = await fetchAndCacheMatches(date, supabaseClient)
        } else {
          console.log(`⚡ Cache hit for ${date}, serving ${matches.length} matches with channel info`)
        }
        
        allMatches.push(...matches)
        
        if (matches.length > 0) {
          console.log(`✅ Added ${matches.length} matches with channel info for ${date}`)
        } else {
          console.log(`📭 No matches found for ${date}`)
        }

      } catch (error) {
        console.warn(`⚠️ Error processing matches for ${date}:`, error)
      }
    }

    allMatches.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.kickoffTime}`)
      const dateB = new Date(`${b.date} ${b.kickoffTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    console.log(`🎯 Returning ${allMatches.length} total matches with enhanced channel info`)

    return new Response(
      JSON.stringify({ 
        matches: allMatches, 
        count: allMatches.length,
        message: allMatches.length > 0 
          ? `✅ Successfully fetched ${allMatches.length} matches with channel info`
          : `📭 No matches found for the requested dates`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in enhanced get-football-data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        matches: [],
        count: 0,
        message: '❌ Failed to fetch enhanced football data'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
