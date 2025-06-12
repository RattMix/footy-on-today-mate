
const API_BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

interface ApiTeam {
  id: number;
  name: string;
  crest: string;
}

interface ApiCompetition {
  id: number;
  name: string;
}

interface ApiMatch {
  id: number;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  utcDate: string;
  status: string;
  competition: ApiCompetition;
}

interface ApiResponse {
  matches: ApiMatch[];
}

export interface Match {
  id: string;
  homeTeam: {
    name: string;
    crest: string;
  };
  awayTeam: {
    name: string;
    crest: string;
  };
  kickoffTime: string;
  date: string;
  channel: {
    name: string;
    logo: string;
  };
  isLive?: boolean;
}

// Map competition IDs to TV channels (this is a simplified mapping)
const getChannelForCompetition = (competitionId: number): { name: string; logo: string } => {
  const channelMap: Record<number, { name: string; logo: string }> = {
    2021: { // Premier League
      name: "SKY SPORTS PREMIER LEAGUE",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
    },
    2001: { // Champions League
      name: "BT SPORT 1",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/BT-Sport-logo.png"
    },
    2015: { // Ligue 1
      name: "BT SPORT 2",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/BT-Sport-logo.png"
    },
    2002: { // Bundesliga
      name: "SKY SPORTS FOOTBALL",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
    },
    2019: { // Serie A
      name: "BT SPORT 3",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/BT-Sport-logo.png"
    },
    2014: { // La Liga
      name: "SKY SPORTS MAIN EVENT",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
    }
  };

  return channelMap[competitionId] || {
    name: "SKY SPORTS PREMIER LEAGUE",
    logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
  };
};

const mapApiMatchToMatch = (apiMatch: ApiMatch): Match => {
  const matchDate = new Date(apiMatch.utcDate);
  const kickoffTime = matchDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  const date = matchDate.toISOString().split('T')[0];
  
  return {
    id: apiMatch.id.toString(),
    homeTeam: {
      name: apiMatch.homeTeam.name.toUpperCase(),
      crest: apiMatch.homeTeam.crest || "https://via.placeholder.com/50"
    },
    awayTeam: {
      name: apiMatch.awayTeam.name.toUpperCase(),
      crest: apiMatch.awayTeam.crest || "https://via.placeholder.com/50"
    },
    kickoffTime,
    date,
    channel: getChannelForCompetition(apiMatch.competition.id),
    isLive: apiMatch.status === 'IN_PLAY'
  };
};

export const fetchMatchesForDateRange = async (dateFrom: string, dateTo: string): Promise<Match[]> => {
  if (!API_KEY) {
    throw new Error('Football API key not found. Please add VITE_FOOTBALL_API_KEY to your environment variables.');
  }

  const response = await fetch(
    `${API_BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: {
        'X-Auth-Token': API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  
  if (!data.matches || !Array.isArray(data.matches)) {
    return [];
  }

  return data.matches
    .filter(match => 
      // Filter for major competitions only
      [2021, 2001, 2015, 2002, 2019, 2014].includes(match.competition.id)
    )
    .map(mapApiMatchToMatch)
    .sort((a, b) => new Date(a.date + ' ' + a.kickoffTime).getTime() - new Date(b.date + ' ' + b.kickoffTime).getTime());
};

export const fetchMatchesForDate = async (date: string): Promise<Match[]> => {
  return fetchMatchesForDateRange(date, date);
};
