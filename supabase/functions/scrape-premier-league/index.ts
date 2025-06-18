
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

// Enhanced channel mapping for better matching
const CHANNEL_MAPPING: Record<string, { name: string; logo: string }> = {
  'sky sports premier league': {
    name: 'SKY SPORTS PREMIER LEAGUE',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'sky sports main event': {
    name: 'SKY SPORTS MAIN EVENT', 
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'sky sports football': {
    name: 'SKY SPORTS FOOTBALL',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Sky-Sports-Logo.png'
  },
  'tnt sports 1': {
    name: 'TNT SPORTS 1',
    logo: 'https://logos-world.net/wp-content/uploads/2023/07/TNT-Sports-Logo.png'
  },
  'tnt sports 2': {
    name: 'TNT SPORTS 2',
    logo: 'https://logos-world.net/wp-content/uploads/2023/07/TNT-Sports-Logo.png'
  },
  'amazon prime video': {
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
  },
  'bt sport 1': {
    name: 'BT SPORT 1',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/BT-Sport-Logo.png'
  },
  'bt sport 2': {
    name: 'BT SPORT 2',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/BT-Sport-Logo.png'
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
  channel: {
    name: string
    logo: string
  }
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
  
  for (const [key, team] of Object.entries(PREMIER_LEAGUE_TEAMS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return team
    }
  }
  
  console.warn(`⚠️ Unknown team: ${teamName}, using fallback`)
  return {
    name: teamName.toUpperCase(),
    crest: 'https://via.placeholder.com/50x50?text=PL'
  }
}

function getChannelInfo(channelText: string): { name: string; logo: string } {
  if (!channelText) {
    return {
      name: 'TBC',
      logo: 'https://via.placeholder.com/100x50?text=TBC'
    }
  }

  const normalized = channelText.toLowerCase().trim()
  
  // Direct matching
  for (const [key, channel] of Object.entries(CHANNEL_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return channel
    }
  }
  
  // Fuzzy matching for common variations
  if (normalized.includes('sky') && normalized.includes('premier')) {
    return CHANNEL_MAPPING['sky sports premier league']
  }
  if (normalized.includes('sky') && normalized.includes('main')) {
    return CHANNEL_MAPPING['sky sports main event']
  }
  if (normalized.includes('tnt') || normalized.includes('bt sport')) {
    return CHANNEL_MAPPING['tnt sports 1']
  }
  if (normalized.includes('amazon') || normalized.includes('prime')) {
    return CHANNEL_MAPPING['amazon prime video']
  }
  if (normalized.includes('bbc')) {
    return CHANNEL_MAPPING['bbc one']
  }
  if (normalized.includes('itv')) {
    return CHANNEL_MAPPING['itv']
  }
  
  // Return formatted unknown channel
  return {
    name: channelText.toUpperCase(),
    logo: 'https://via.placeholder.com/100x50?text=TV'
  }
}

function parseFixtures(html: string, targetDate: string): PremierLeagueFixture[] {
  console.log('🔍 Parsing Premier League fixtures with channel extraction...')
  
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    throw new Error('Failed to parse HTML')
  }

  const fixtures: PremierLeagueFixture[] = []
  
  // Multiple selectors for fixture elements on Premier League website
  const fixtureSelectors = [
    '.fixtures__date-container .fixture',
    '.matchCard',
    '.fixture-list__item',
    '.match-fixture',
    '[data-testid="fixture"]',
    '.fixture',
    '.widget-fixture',
    '.mc-fixture'
  ]
  
  let fixtureElements: any[] = []
  
  for (const selector of fixtureSelectors) {
    fixtureElements = Array.from(doc.querySelectorAll(selector))
    console.log(`🔍 Trying selector "${selector}": found ${fixtureElements.length} elements`)
    if (fixtureElements.length > 0) {
      break
    }
  }
  
  if (fixtureElements.length === 0) {
    console.log('⚠️ No fixture elements found, trying fallback approach...')
    // Fallback: find elements containing Premier League team names
    const allElements = Array.from(doc.querySelectorAll('*'))
    const teamNames = Object.keys(PREMIER_LEAGUE_TEAMS)
    
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase() || ''
      const foundTeams = teamNames.filter(team => text.includes(team))
      
      if (foundTeams.length >= 2) {
        fixtureElements.push(element)
      }
    }
  }
  
  console.log(`📊 Processing ${fixtureElements.length} potential fixture elements`)
  
  fixtureElements.forEach((element: any, index: number) => {
    try {
      const elementText = element.textContent || ''
      
      // Extract team names
      let homeTeamName = '', awayTeamName = '', kickoffTime = '15:00', channelText = ''
      
      // Strategy 1: Look for team name selectors
      const teamSelectors = [
        '.team-name, .fixture__team-name, .home-team, .away-team',
        '.club-name, .team',
        '[data-team], [data-home-team], [data-away-team]'
      ]
      
      for (const teamSelector of teamSelectors) {
        const teamElements = element.querySelectorAll(teamSelector)
        if (teamElements.length >= 2) {
          homeTeamName = teamElements[0].textContent?.trim() || ''
          awayTeamName = teamElements[1].textContent?.trim() || ''
          break
        }
      }
      
      // Strategy 2: Parse from text using known team names
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
        }
      }
      
      // Extract kick-off time
      const timeSelectors = [
        '.kick-off-time, .fixture__time, .time',
        '.kickoff, .match-time',
        '[data-time], [data-kickoff]'
      ]
      
      for (const timeSelector of timeSelectors) {
        const timeElement = element.querySelector(timeSelector)
        if (timeElement) {
          kickoffTime = timeElement.textContent?.trim() || '15:00'
          break
        }
      }
      
      // Look for time in element text
      if (kickoffTime === '15:00') {
        const timeMatch = elementText.match(/\b(\d{1,2}):(\d{2})\b/)
        if (timeMatch) {
          kickoffTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
        }
      }
      
      // Extract channel information - this is the key enhancement
      const channelSelectors = [
        '.broadcast, .broadcaster, .channel',
        '.tv-channel, .tv-info, .broadcast-info',
        '.fixture__broadcaster, .match__broadcaster',
        '[data-broadcaster], [data-channel]',
        '.coverage, .live-coverage'
      ]
      
      for (const channelSelector of channelSelectors) {
        const channelElement = element.querySelector(channelSelector)
        if (channelElement) {
          channelText = channelElement.textContent?.trim() || ''
          if (channelText) break
        }
      }
      
      // Look for channel info in surrounding elements or parent containers
      if (!channelText) {
        const parent = element.parentElement
        if (parent) {
          for (const channelSelector of channelSelectors) {
            const channelElement = parent.querySelector(channelSelector)
            if (channelElement) {
              channelText = channelElement.textContent?.trim() || ''
              if (channelText) break
            }
          }
        }
      }
      
      // Search for common broadcaster keywords in text
      if (!channelText) {
        const broadcasterKeywords = ['sky sports', 'tnt sports', 'bt sport', 'amazon prime', 'bbc', 'itv']
        for (const keyword of broadcasterKeywords) {
          if (elementText.toLowerCase().includes(keyword)) {
            channelText = keyword
            break
          }
        }
      }
      
      if (homeTeamName && awayTeamName) {
        const homeTeam = getTeamInfo(homeTeamName)
        const awayTeam = getTeamInfo(awayTeamName)
        const channel = getChannelInfo(channelText)
        
        const fixture: PremierLeagueFixture = {
          id: `pl-${targetDate}-${index}`,
          homeTeam,
          awayTeam,
          kickoffTime,
          date: targetDate,
          competition: 'Premier League',
          channel,
          status: 'SCHEDULED'
        }
        
        fixtures.push(fixture)
        console.log(`✅ Parsed fixture: ${homeTeam.name} vs ${awayTeam.name} at ${kickoffTime} on ${channel.name}`)
      }
    } catch (error) {
      console.warn(`⚠️ Error parsing fixture ${index}:`, error)
    }
  })
  
  return fixtures
}

async function fetchFromMultipleSources(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🔄 Fetching Premier League fixtures with channel info for ${date}`)
  
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
          console.log(`🎉 Successfully found ${fixtures.length} fixtures with channel info from ${source.name}!`)
          return fixtures
        }
        
        console.log(`📭 No fixtures found from ${source.name}, trying next URL...`)
        
      } catch (error) {
        console.warn(`⚠️ Error fetching from ${url}:`, error)
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return []
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Enhanced Premier League scraper with channel extraction started!')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { date } = await req.json()
    console.log(`📅 Scraping Premier League fixtures with channels for: ${date}`)

    const { error: deleteError } = await supabaseClient
      .from('matches_cache')
      .delete()
      .eq('date', date)
      .eq('competition_id', 39)

    if (deleteError) {
      console.warn('⚠️ Error clearing cache:', deleteError)
    }

    const fixtures = await fetchFromMultipleSources(date)
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    const { error: insertError } = await supabaseClient
      .from('matches_cache')
      .upsert({
        date,
        competition_id: 39,
        match_data: fixtures,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('❌ Cache insert error:', insertError)
    } else {
      console.log(`💾 Successfully cached ${fixtures.length} fixtures with channel info!`)
    }

    return new Response(
      JSON.stringify({ 
        data: { response: fixtures }, 
        cached: false,
        message: fixtures.length > 0 
          ? `🏆 Found ${fixtures.length} Premier League fixtures with channel info! 📺`
          : `📭 No fixtures found for ${date}.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in Premier League scraper:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: '😅 Could not fetch fixtures with channel info.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
