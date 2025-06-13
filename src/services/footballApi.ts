
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
  console.log(`📡 Fetching matches from backend API for ${dateFrom} to ${dateTo}`);

  try {
    console.log(`🔄 Calling get-football-data function...`);
    
    const { data, error } = await supabase.functions.invoke('get-football-data', {
      body: { dateFrom, dateTo }
    });

    console.log(`📊 Backend response:`, { data, error });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Backend API error: ${error.message}`);
    }

    if (!data) {
      console.warn('⚠️ No data returned from backend');
      return [];
    }

    // Handle both old and new response formats
    const matches = data.matches || data || [];
    
    console.log(`✅ Backend returned ${matches.length} matches`);
    return matches;

  } catch (error) {
    console.error('💥 Error calling backend API:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('TypeError') || error.message.includes('NetworkError')) {
        throw new Error('Network connection error. Please check your internet connection.');
      }
      if (error.message.includes('CORS')) {
        throw new Error('Service configuration error. Please try again later.');
      }
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred while fetching football data');
  }
};

export const fetchMatchesForDate = async (date: string): Promise<Match[]> => {
  return fetchMatchesForDateRange(date, date);
};
