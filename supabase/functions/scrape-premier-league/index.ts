
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
  },
  'leicester': {
    name: 'LEICESTER CITY',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t13.png'
  },
  'ipswich': {
    name: 'IPSWICH TOWN',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t40.png'
  },
  'southampton': {
    name: 'SOUTHAMPTON',
    crest: 'https://resources.premierleague.com/premierleague/badges/50/t20.png'
  }
}

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

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/fc$|cf$|united$|city$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

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

function parseFixtures(html: string, targetDate: string): PremierLeagueFixture[] {
  console.log('🔍 Parsing Premier League fixtures...')
  console.log(`📄 HTML length: ${html.length} characters`)
  
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    throw new Error('Failed to parse HTML')
  }

  const fixtures: PremierLeagueFixture[] = []
  
  // Updated selectors for current Premier League website structure
  const fixtureSelectors = [
    '.fixtures__date-container .fixres__item',
    '.fixture',
    '.match-fixture',
    '.fixture-list__item',
    '[data-testid="fixture"]',
    '.fixres__item',
    '.widget-fixture'
  ]
  
  let fixtureElements: any[] = []
  
  // Try each selector until we find fixtures
  for (const selector of fixtureSelectors) {
    fixtureElements = Array.from(doc.querySelectorAll(selector))
    console.log(`🔍 Trying selector "${selector}": found ${fixtureElements.length} elements`)
    if (fixtureElements.length > 0) {
      break
    }
  }
  
  if (fixtureElements.length === 0) {
    console.log('⚠️ No fixture elements found with any selector. Trying generic approach...')
    
    // Fallback: look for any elements containing team names
    const allElements = Array.from(doc.querySelectorAll('*'))
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase() || ''
      const teamNames = Object.keys(PREMIER_LEAGUE_TEAMS)
      const foundTeams = teamNames.filter(team => text.includes(team))
      
      if (foundTeams.length >= 2) {
        fixtureElements.push(element)
        console.log(`🎯 Found potential fixture element with teams: ${foundTeams.join(', ')}`)
      }
    }
  }
  
  console.log(`📊 Processing ${fixtureElements.length} potential fixture elements`)
  
  fixtureElements.forEach((element: any, index: number) => {
    try {
      const elementText = element.textContent || ''
      console.log(`🔍 Element ${index}: "${elementText.slice(0, 100)}..."`)
      
      // Multiple strategies to extract team names
      let homeTeamName = '', awayTeamName = '', kickoffTime = '15:00'
      
      // Strategy 1: Look for specific team name selectors
      const teamSelectors = [
        '.team-name, .fixture__team-name, .fixres__team-name',
        '.home-team, .away-team',
        '.team, .club',
        '[data-team], [data-home-team], [data-away-team]'
      ]
      
      for (const teamSelector of teamSelectors) {
        const teamElements = element.querySelectorAll(teamSelector)
        if (teamElements.length >= 2) {
          homeTeamName = teamElements[0].textContent?.trim() || ''
          awayTeamName = teamElements[1].textContent?.trim() || ''
          console.log(`✅ Found teams via selector "${teamSelector}": ${homeTeamName} vs ${awayTeamName}`)
          break
        }
      }
      
      // Strategy 2: Parse from element text using known team names
      if (!homeTeamName || !awayTeamName) {
        const teamNames = Object.keys(PREMIER_LEAGUE_TEAMS)
        const foundTeams: string[] = []
        
        for (const teamName of teamNames) {
          if (elementText.toLowerCase().includes(teamName)) {
            foundTeams.push(teamName)
          }
        }
        
        if (foundTeams.length >= 2) {
          const team1 = PREMIER_LEAGUE_TEAMS[foundTeams[0]]
          const team2 = PREMIER_LEAGUE_TEAMS[foundTeams[1]]
          homeTeamName = team1.name
          awayTeamName = team2.name
          console.log(`✅ Found teams via text parsing: ${homeTeamName} vs ${awayTeamName}`)
        }
      }
      
      // Extract kick-off time
      const timeSelectors = [
        '.kick-off-time, .fixture__time, .fixres__time',
        '.time, .kickoff',
        '[data-time], [data-kickoff]'
      ]
      
      for (const timeSelector of timeSelectors) {
        const timeElement = element.querySelector(timeSelector)
        if (timeElement) {
          kickoffTime = timeElement.textContent?.trim() || '15:00'
          break
        }
      }
      
      // Look for time in element text (format: HH:MM)
      if (kickoffTime === '15:00') {
        const timeMatch = elementText.match(/\b(\d{1,2}):(\d{2})\b/)
        if (timeMatch) {
          kickoffTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
        }
      }
      
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
        console.log(`✅ Successfully parsed fixture: ${homeTeam.name} vs ${awayTeam.name} at ${kickoffTime}`)
      }
    } catch (error) {
      console.warn(`⚠️ Error parsing fixture ${index}:`, error)
    }
  })
  
  return fixtures
}

async function fetchFromMultipleSources(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🔄 Fetching Premier League fixtures for ${date} from multiple sources`)
  
  // Multiple sources to try
  const sources = [
    {
      name: 'Premier League Official',
      urls: [
        `https://www.premierleague.com/fixtures?co=1&cl=-1`,
        `https://www.premierleague.com/fixtures`,
        `https://www.premierleague.com/fixtures?date=${date}`
      ]
    },
    {
      name: 'BBC Sport',
      urls: [
        `https://www.bbc.co.uk/sport/football/premier-league/fixtures`,
        `https://www.bbc.co.uk/sport/football/premier-league`
      ]
    },
    {
      name: 'Sky Sports',
      urls: [
        `https://www.skysports.com/premier-league-fixtures`,
        `https://www.skysports.com/football/premier-league/fixtures`
      ]
    }
  ]
  
  for (const source of sources) {
    console.log(`🌐 Trying source: ${source.name}`)
    
    for (const url of source.urls) {
      try {
        console.log(`🔗 Fetching: ${url}`)
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
          },
        })

        if (!response.ok) {
          console.warn(`❌ HTTP ${response.status} for ${url}`)
          continue
        }

        const html = await response.text()
        console.log(`📄 Received ${html.length} characters from ${source.name}`)
        
        const fixtures = parseFixtures(html, date)
        
        if (fixtures.length > 0) {
          console.log(`🎉 Successfully found ${fixtures.length} fixtures from ${source.name}!`)
          return fixtures
        }
        
        console.log(`📭 No fixtures found from ${source.name}, trying next URL...`)
        
      } catch (error) {
        console.warn(`⚠️ Error fetching from ${url}:`, error)
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  console.log('📝 No fixtures found from any source, checking if this is a match day...')
  
  // If it's actually a match day but we can't scrape, return sample data for testing
  const today = new Date()
  const targetDateObj = new Date(date)
  const dayOfWeek = targetDateObj.getDay() // 0 = Sunday, 6 = Saturday
  
  // Premier League typically plays on weekends (Saturday/Sunday) and some weekdays
  if (dayOfWeek === 0 || dayOfWeek === 6 || Math.abs(targetDateObj.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000) {
    console.log('🏈 This looks like it could be a match day, but scraping failed. Returning empty array.')
  }
  
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

    // Clear any corrupted cache first
    console.log('🧹 Clearing any existing cache for this date...')
    const { error: deleteError } = await supabaseClient
      .from('matches_cache')
      .delete()
      .eq('date', date)
      .eq('competition_id', 39)

    if (deleteError) {
      console.warn('⚠️ Error clearing cache:', deleteError)
    } else {
      console.log('✅ Cache cleared successfully')
    }

    // Fetch fresh data
    const fixtures = await fetchFromMultipleSources(date)
    
    const scrapedData = {
      fixtures,
      scrapedAt: new Date().toISOString(),
      source: 'multiple-sources',
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
    } else {
      console.log(`💾 Successfully cached ${fixtures.length} Premier League fixtures for 24 hours!`)
    }

    console.log(`🎯 Returning ${fixtures.length} Premier League fixtures`)

    return new Response(
      JSON.stringify({ 
        data: { response: fixtures }, 
        cached: false,
        message: fixtures.length > 0 
          ? `🏆 Found ${fixtures.length} Premier League fixtures! ⚽`
          : `📭 No fixtures found for ${date}. This might not be a match day.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in Premier League scraper:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: '😅 Oops! Could not fetch fixtures. The websites might be having issues.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
