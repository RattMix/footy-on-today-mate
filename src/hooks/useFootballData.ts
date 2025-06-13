
import { useQuery } from '@tanstack/react-query';
import { fetchMatchesForDateRange, type Match } from '../services/footballApi';

const getDateRange = (selectedDate: Date) => {
  // Get matches for a week around the selected date
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - 3);
  
  const endDate = new Date(selectedDate);
  endDate.setDate(endDate.getDate() + 7);
  
  return {
    dateFrom: startDate.toISOString().split('T')[0],
    dateTo: endDate.toISOString().split('T')[0]
  };
};

export const useFootballData = (selectedDate: Date) => {
  const { dateFrom, dateTo } = getDateRange(selectedDate);
  
  return useQuery<Match[], Error>({
    queryKey: ['matches', dateFrom, dateTo],
    queryFn: () => fetchMatchesForDateRange(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Reduced retries to fail faster
    retryDelay: (attemptIndex) => Math.min(1000 * attemptIndex, 5000), // Faster retry delay
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Add timeout behavior
    meta: {
      errorMessage: 'Failed to load football data'
    }
  });
};
