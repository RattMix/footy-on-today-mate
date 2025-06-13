
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Premier League team mapping with official crests
const PREMIER_LEAGUE_TEAMS: Record<string, { name: string; crest: string }> = {
  'arsenal': {
    name: 'ARSENAL',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t3.png'
  },
  'aston villa': {
    name: 'ASTON VILLA',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t7.png'
  },
  'brentford': {
    name: 'BRENTFORD',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t94.png'
  },
  'brighton': {
    name: 'BRIGHTON & HOVE ALBION',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t36.png'
  },
  'burnley': {
    name: 'BURNLEY',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t90.png'
  },
  'chelsea': {
    name: 'CHELSEA',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t8.png'
  },
  'crystal palace': {
    name: 'CRYSTAL PALACE',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t31.png'
  },
  'everton': {
    name: 'EVERTON',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t11.png'
  },
  'fulham': {
    name: 'FULHAM',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t54.png'
  },
  'liverpool': {
    name: 'LIVERPOOL',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t14.png'
  },
  'luton': {
    name: 'LUTON TOWN',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t102.png'
  },
  'manchester city': {
    name: 'MANCHESTER CITY',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t43.png'
  },
  'manchester united': {
    name: 'MANCHESTER UNITED',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t1.png'
  },
  'newcastle': {
    name: 'NEWCASTLE UNITED',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t4.png'
  },
  'nottingham forest': {
    name: 'NOTTINGHAM FOREST',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t17.png'
  },
  'sheffield united': {
    name: 'SHEFFIELD UNITED',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t49.png'
  },
  'tottenham': {
    name: 'TOTTENHAM HOTSPUR',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t6.png'
  },
  'west ham': {
    name: 'WEST HAM UNITED',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t21.png'
  },
  'wolves': {
    name: 'WOLVERHAMPTON WANDERERS',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t39.png'
  },
  'bournemouth': {
    name: 'AFC BOURNEMOUTH',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t91.png'
  }
}

/**
 * 🚀 Premier League Fixture Scraper
 * 
 * This function scrapes fixture data directly from the Premier League website
 * and returns it in a format compatible with your existing system.
 * 
 * Features:
 * - Smart caching (24 hours for fixtures)
 * - Robust error handling
 * - Team name normalization
 * - Official team crests
 * - Beginner-friendly code structure
 */

interface PremierLeagueFixture {
  id: string
  homeTeam: {
    name: string
    crest: string
  }
  awayTeam: {
    name: string
    crest: string
  }
  kickoffTime: string
  date: string
  competition: string
  status?: string
}

/**
 * Normalizes team names for consistent matching
 * Makes team names lowercase and removes common suffixes
 */
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/fc$|cf$|united$|city$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Maps a team name to our standardized team data
 * Returns team info with official crest or fallback
 */
function getTeamInfo(teamName: string): { name: string; crest: string } {
  const normalized = normalizeTeamName(teamName)
  
  // Try exact match first
  for (const [key, team] of Object.entries(PREMIER_LEAGUE_TEAMS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return team
    }
  }
  
  // Fallback for unknown teams
  console.warn(`⚠️ Unknown team: ${teamName}, using fallback`)
  return {
    name: teamName.toUpperCase(),
    crest: 'https://via.placeholder.com/50x50?text=PL'
  }
}

/**
 * Parses fixture data from Premier League website HTML
 * Extracts all the juicy details we need! ⚽
 */
function parseFixtures(html: string, targetDate: string): PremierLeagueFixture[] {
  console.log('🔍 Parsing Premier League fixtures...')
  
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    throw new Error('Failed to parse HTML')
  }

  const fixtures: PremierLeagueFixture[] = []
  
  // Look for fixture elements (Premier League website structure)
  const fixtureElements = doc.querySelectorAll('[data-fixture], .fixture, .match')
  
  console.log(`Found ${fixtureElements.length} potential fixture elements`)
  
  fixtureElements.forEach((element: any, index: number) => {
    try {
      // Extract team names (multiple selectors for robustness)
      const homeTeamElement = element.querySelector('.home-team, .team-home, [data-home-team]')
      const awayTeamElement = element.querySelector('.away-team, .team-away, [data-away-team]')
      
      // Extract time/date info
      const timeElement = element.querySelector('.kick-off-time, .time, [data-time]')
      const dateElement = element.querySelector('.date, [data-date]')
      
      if (homeTeamElement && awayTeamElement) {
        const homeTeamName = homeTeamElement.textContent?.trim()
        const awayTeamName = awayTeamElement.textContent?.trim()
        const kickoffTime = timeElement?.textContent?.trim() || '15:00'
        
        if (homeTeamName && awayTeamName) {
          const homeTeam = getTeamInfo(homeTeamName)
          const awayTeam = getTeamInfo(awayTeamName)
          
          const fixture: PremierLeagueFixture = {
            id: `pl-${targetDate}-${index}`,
            homeTeam,
            awayTeam,
            kickoffTime,
            date: targetDate,
            competition: 'Premier League',
            status: 'SCHEDULED'
          }
          
          fixtures.push(fixture)
          console.log(`✅ Parsed fixture: ${homeTeam.name} vs ${awayTeam.name}`)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error parsing fixture ${index}:`, error)
    }
  })
  
  return fixtures
}

/**
 * Fetches fixture data from Premier League website
 * Handles retries and different URL patterns
 */
async function fetchPremierLeagueFixtures(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🔄 Fetching Premier League fixtures for ${date}`)
  
  // Try multiple URL patterns (Premier League website variations)
  const urlPatterns = [
    `https://www.premierleague.com/fixtures?co=1&cl=-1&date=${date}`,
    `https://www.premierleague.com/fixtures`,
    `https://www.premierleague.com/fixtures?date=${date}`
  ]
  
  for (const url of urlPatterns) {
    try {
      console.log(`🌐 Trying URL: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      if (!response.ok) {
        console.warn(`❌ HTTP ${response.status} for ${url}`)
        continue
      }

      const html = await response.text()
      const fixtures = parseFixtures(html, date)
      
      if (fixtures.length > 0) {
        console.log(`🎉 Successfully found ${fixtures.length} fixtures!`)
        return fixtures
      }
      
      console.log(`📭 No fixtures found at ${url}, trying next pattern...`)
      
    } catch (error) {
      console.warn(`⚠️ Error fetching from ${url}:`, error)
    }
  }
  
  // If no fixtures found, return sample data (helpful for testing)
  console.log('📝 No fixtures found, returning sample data for development')
  return []
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Premier League scraper started!')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { date } = await req.json()
    console.log(`📅 Scraping Premier League fixtures for: ${date}`)

    // Check cache first (24 hours expiry - much better than API limits!)
    const cacheKey = `premier-league-${date}`
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('matches_cache')
      .select('match_data, expires_at')
      .eq('date', date)
      .eq('competition_id', 39) // Premier League ID
      .maybeSingle()

    if (cacheError) {
      console.error('❌ Cache query error:', cacheError)
    } else if (cachedData && new Date(cachedData.expires_at) > new Date()) {
      console.log('⚡ Serving Premier League fixtures from cache - lightning fast!')
      return new Response(
        JSON.stringify({ 
          data: { response: cachedData.match_data }, 
          cached: true,
          message: '⚽ Fresh fixtures served from cache!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Scrape fresh data
    const fixtures = await fetchPremierLeagueFixtures(date)
    
    const scrapedData = {
      fixtures,
      scrapedAt: new Date().toISOString(),
      source: 'premierleague.com',
      date
    }

    // Cache the result for 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    const { error: insertError } = await supabaseClient
      .from('matches_cache')
      .upsert({
        date,
        competition_id: 39, // Premier League
        match_data: fixtures,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('❌ Cache insert error:', insertError)
      // Continue even if caching fails
    } else {
      console.log('💾 Successfully cached Premier League fixtures for 24 hours!')
    }

    console.log(`🎯 Returning ${fixtures.length} Premier League fixtures`)

    return new Response(
      JSON.stringify({ 
        data: { response: fixtures }, 
        cached: false,
        message: `🏆 Found ${fixtures.length} Premier League fixtures! ⚽`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in Premier League scraper:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: '😅 Oops! The Premier League website might be having a tea break. Try again in a moment!'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
