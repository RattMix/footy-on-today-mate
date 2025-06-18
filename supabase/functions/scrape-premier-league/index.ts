
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

async function scrapeFromBBCSport(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🌐 Trying BBC Sport for ${date}`)
  
  try {
    const response = await fetch('https://www.bbc.co.uk/sport/football/premier-league/fixtures', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      console.warn(`❌ BBC Sport HTTP ${response.status}`)
      return []
    }

    const html = await response.text()
    console.log(`📄 BBC Sport HTML received: ${html.length} chars`)
    
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) return []

    const fixtures: PremierLeagueFixture[] = []
    
    // BBC Sport fixture selectors
    const fixtureElements = doc.querySelectorAll('.fixture, .match, .qa-match-block, [data-testid="fixture"]')
    console.log(`🔍 BBC found ${fixtureElements.length} fixture elements`)
    
    fixtureElements.forEach((element: any, index: number) => {
      try {
        const text = element.textContent || ''
        
        // Look for team names
        const teamElements = element.querySelectorAll('.team-name, .qa-full-team-name, .team')
        let homeTeam = '', awayTeam = '', time = '15:00', channel = ''
        
        if (teamElements.length >= 2) {
          homeTeam = teamElements[0].textContent?.trim() || ''
          awayTeam = teamElements[1].textContent?.trim() || ''
        }
        
        // Extract time
        const timeElement = element.querySelector('.fixture__number, .time, .kick-off')
        if (timeElement) {
          time = timeElement.textContent?.trim() || '15:00'
        }
        
        // Look for channel info
        const channelElement = element.querySelector('.fixture__channel, .broadcast, .live-coverage')
        if (channelElement) {
          channel = channelElement.textContent?.trim() || ''
        }
        
        if (homeTeam && awayTeam) {
          fixtures.push({
            id: `bbc-${date}-${index}`,
            homeTeam: getTeamInfo(homeTeam),
            awayTeam: getTeamInfo(awayTeam),
            kickoffTime: time,
            date,
            competition: 'Premier League',
            channel: getChannelInfo(channel),
            status: 'SCHEDULED'
          })
          console.log(`✅ BBC parsed: ${homeTeam} vs ${awayTeam} - ${channel || 'No channel'}`)
        }
      } catch (error) {
        console.warn(`⚠️ BBC parsing error ${index}:`, error)
      }
    })
    
    return fixtures
  } catch (error) {
    console.error(`💥 BBC Sport scraping failed:`, error)
    return []
  }
}

async function scrapeFromSkySports(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🌐 Trying Sky Sports for ${date}`)
  
  try {
    const response = await fetch('https://www.skysports.com/premier-league-fixtures', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      console.warn(`❌ Sky Sports HTTP ${response.status}`)
      return []
    }

    const html = await response.text()
    console.log(`📄 Sky Sports HTML received: ${html.length} chars`)
    
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) return []

    const fixtures: PremierLeagueFixture[] = []
    
    // Sky Sports fixture selectors
    const fixtureElements = doc.querySelectorAll('.fixres__item, .match-fixture, .fixture')
    console.log(`🔍 Sky found ${fixtureElements.length} fixture elements`)
    
    fixtureElements.forEach((element: any, index: number) => {
      try {
        // Look for team names
        const teamElements = element.querySelectorAll('.swap-text__target, .team-name, .team')
        let homeTeam = '', awayTeam = '', time = '15:00', channel = 'SKY SPORTS'
        
        if (teamElements.length >= 2) {
          homeTeam = teamElements[0].textContent?.trim() || ''
          awayTeam = teamElements[1].textContent?.trim() || ''
        }
        
        // Extract time
        const timeElement = element.querySelector('.fixres__number, .kick-off-time')
        if (timeElement) {
          time = timeElement.textContent?.trim() || '15:00'
        }
        
        if (homeTeam && awayTeam) {
          fixtures.push({
            id: `sky-${date}-${index}`,
            homeTeam: getTeamInfo(homeTeam),
            awayTeam: getTeamInfo(awayTeam),
            kickoffTime: time,
            date,
            competition: 'Premier League',
            channel: getChannelInfo(channel),
            status: 'SCHEDULED'
          })
          console.log(`✅ Sky parsed: ${homeTeam} vs ${awayTeam}`)
        }
      } catch (error) {
        console.warn(`⚠️ Sky parsing error ${index}:`, error)
      }
    })
    
    return fixtures
  } catch (error) {
    console.error(`💥 Sky Sports scraping failed:`, error)
    return []
  }
}

async function scrapeFromLiveSportOnTV(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🌐 Trying LiveSportOnTV for ${date}`)
  
  try {
    const response = await fetch('https://www.livesportontv.com/sport/football/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      console.warn(`❌ LiveSportOnTV HTTP ${response.status}`)
      return []
    }

    const html = await response.text()
    console.log(`📄 LiveSportOnTV HTML received: ${html.length} chars`)
    
    const doc = new DOMParser().parseFromString(html, 'text/html')
    if (!doc) return []

    const fixtures: PremierLeagueFixture[] = []
    
    // LiveSportOnTV fixture selectors
    const rows = doc.querySelectorAll('tr, .listing-row, .match-row')
    console.log(`🔍 LiveSportOnTV found ${rows.length} rows`)
    
    rows.forEach((row: any, index: number) => {
      try {
        const text = row.textContent || ''
        
        // Look for Premier League matches
        if (!text.toLowerCase().includes('premier') && !text.toLowerCase().includes('football')) {
          return
        }
        
        const cells = row.querySelectorAll('td, .cell')
        if (cells.length >= 3) {
          let time = '', teams = '', channel = ''
          
          cells.forEach((cell: any) => {
            const cellText = cell.textContent?.trim() || ''
            
            // Time pattern
            if (/\d{1,2}:\d{2}/.test(cellText)) {
              time = cellText
            }
            // Teams pattern (vs or v)
            else if (cellText.includes(' v ') || cellText.includes(' vs ')) {
              teams = cellText
            }
            // Channel pattern
            else if (cellText.toLowerCase().includes('sky') || 
                     cellText.toLowerCase().includes('tnt') || 
                     cellText.toLowerCase().includes('bbc') ||
                     cellText.toLowerCase().includes('itv')) {
              channel = cellText
            }
          })
          
          if (teams && teams.includes(' v ')) {
            const teamArray = teams.split(' v ')
            if (teamArray.length === 2) {
              const homeTeam = teamArray[0].trim()
              const awayTeam = teamArray[1].trim()
              
              fixtures.push({
                id: `lstv-${date}-${index}`,
                homeTeam: getTeamInfo(homeTeam),
                awayTeam: getTeamInfo(awayTeam),
                kickoffTime: time || '15:00',
                date,
                competition: 'Premier League',
                channel: getChannelInfo(channel),
                status: 'SCHEDULED'
              })
              console.log(`✅ LSTV parsed: ${homeTeam} vs ${awayTeam} - ${channel}`)
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ LSTV parsing error ${index}:`, error)
      }
    })
    
    return fixtures
  } catch (error) {
    console.error(`💥 LiveSportOnTV scraping failed:`, error)
    return []
  }
}

async function fetchFromMultipleSources(date: string): Promise<PremierLeagueFixture[]> {
  console.log(`🔄 Multi-source scraping for ${date}`)
  
  // Try all sources in parallel for better speed
  const sourcePromises = [
    scrapeFromBBCSport(date),
    scrapeFromSkyStats(date),
    scrapeFromLiveSportOnTV(date)
  ]
  
  try {
    const results = await Promise.allSettled(sourcePromises)
    let allFixtures: PremierLeagueFixture[] = []
    
    results.forEach((result, index) => {
      const sourceName = ['BBC Sport', 'Sky Sports', 'LiveSportOnTV'][index]
      
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`✅ ${sourceName}: ${result.value.length} fixtures`)
        allFixtures.push(...result.value)
      } else {
        console.log(`❌ ${sourceName}: failed or no data`)
      }
    })
    
    // Remove duplicates based on team names
    const uniqueFixtures = allFixtures.filter((fixture, index, array) => {
      return array.findIndex(f => 
        f.homeTeam.name === fixture.homeTeam.name && 
        f.awayTeam.name === fixture.awayTeam.name
      ) === index
    })
    
    console.log(`🎯 Final result: ${uniqueFixtures.length} unique fixtures`)
    return uniqueFixtures
    
  } catch (error) {
    console.error(`💥 Multi-source scraping failed:`, error)
    return []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Enhanced Premier League scraper with multi-source fallback started!')
    
    const supabaseClient = createClient(
      'https://bxgsfctuzxjhczioymqx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { date } = await req.json()
    console.log(`📅 Multi-source scraping for: ${date}`)

    // Clear cache for this date first
    const { error: deleteError } = await supabaseClient
      .from('matches_cache')
      .delete()
      .eq('date', date)
      .eq('competition_id', 39)

    if (deleteError) {
      console.warn('⚠️ Error clearing cache:', deleteError)
    } else {
      console.log(`🗑️ Cleared cache for ${date}`)
    }

    const fixtures = await fetchFromMultipleSources(date)
    
    // Only cache if we have actual fixtures
    if (fixtures.length > 0) {
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
    } else {
      console.warn(`⚠️ No fixtures found - not caching empty results`)
    }

    return new Response(
      JSON.stringify({ 
        data: { response: fixtures }, 
        cached: false,
        message: fixtures.length > 0 
          ? `🏆 Found ${fixtures.length} Premier League fixtures with channel info! 📺`
          : `📭 No fixtures found for ${date}. This might be an off-season date or before fixtures are published.`
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
