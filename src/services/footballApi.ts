
import { supabase } from '@/integrations/supabase/client';

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
  competition?: string;
  tvMatch?: {
    originalChannel: string;
    matchConfidence: string;
  } | null;
}

export const fetchMatchesForDateRange = async (dateFrom: string, dateTo: string): Promise<Match[]> => {
  console.log(`Fetching matches from backend API for ${dateFrom} to ${dateTo}`);

  try {
    const { data, error } = await supabase.functions.invoke('get-football-data', {
      body: { dateFrom, dateTo }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Backend API error: ${error.message}`);
    }

    if (!data || !data.matches) {
      console.warn('No matches returned from backend');
      return [];
    }

    console.log(`Backend returned ${data.matches.length} matches`);
    return data.matches;

  } catch (error) {
    console.error('Error calling backend API:', error);
    throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchMatchesForDate = async (date: string): Promise<Match[]> => {
  return fetchMatchesForDateRange(date, date);
};
