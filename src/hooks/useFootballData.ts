
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
  
  return useQuery({
    queryKey: ['matches', dateFrom, dateTo],
    queryFn: () => fetchMatchesForDateRange(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
