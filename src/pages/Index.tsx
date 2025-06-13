
import MatchDisplay from "../components/MatchDisplay";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import { type Match } from "../services/footballApi";

const Index = () => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    data: allMatches = [],
    isLoading,
    error,
    refetch
  } = useFootballData(selectedDate);

  console.log(`🎯 Index component state:`, {
    allMatchesCount: allMatches.length,
    isLoading,
    error: error?.message,
    selectedDate: selectedDate.toISOString().split('T')[0],
    currentMatchIndex
  });

  const handleNextGame = () => {
    if (allMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIndex);
    
    // Update selected date to match the new current match
    const nextMatch = allMatches[nextIndex];
    if (nextMatch) {
      setSelectedDate(new Date(nextMatch.date));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    console.log(`📅 Date changed to: ${date.toISOString().split('T')[0]}`);
    setSelectedDate(date);
    
    // Find the first match for this date and set it as current
    const dateString = date.toISOString().split('T')[0];
    const matchIndex = allMatches.findIndex(match => match.date === dateString);
    
    if (matchIndex !== -1) {
      console.log(`🎯 Setting current match index to: ${matchIndex}`);
      setCurrentMatchIndex(matchIndex);
    } else {
      console.log(`📭 No matches found for selected date, keeping current index`);
      // Reset to 0 if no matches found for the selected date
      setCurrentMatchIndex(0);
    }
  };

  const getMatchesForDate = (date: Date): Match[] => {
    const dateString = date.toISOString().split('T')[0];
    return allMatches.filter(match => match.date === dateString);
  };

  const selectedDateMatches = getMatchesForDate(selectedDate);

  const getMatchCounter = () => {
    if (selectedDateMatches.length === 0) {
      return "";
    }
    
    const currentMatch = allMatches[currentMatchIndex];
    const currentMatchDate = currentMatch?.date;
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    if (currentMatchDate !== selectedDateString) {
      return `${selectedDateMatches.length} MATCH${selectedDateMatches.length !== 1 ? 'ES' : ''} TODAY`;
    }
    
    const currentMatchInDay = selectedDateMatches.findIndex(match => match.id === currentMatch?.id);
    return `GAME ${currentMatchInDay + 1} OF ${selectedDateMatches.length}`;
  };

  // Show loading state only initially
  if (isLoading) {
    return <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-header text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <LoadingDisplay />
        </div>

        <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
          OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
        </div>
      </div>;
  }

  // Show error state but still allow date selection
  if (error) {
    return <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-header text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <ErrorDisplay error={error as Error} onRetry={() => refetch()} />
        </div>

        <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
          OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
        </div>
      </div>;
  }

  // Main content - always show the UI even with no matches
  const currentMatch = allMatches[currentMatchIndex];
  const hasCurrentMatch = currentMatch && allMatches.length > 0;

  return <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
        <div className="teletext-header text-base md:text-4xl inline-block py-2 md:py-4">
          WHAT CHANNEL IS THE FOOTBALL ON
        </div>
      </div>

      <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
        {hasCurrentMatch ? (
          <MatchDisplay 
            match={currentMatch} 
            onNextGame={handleNextGame} 
            onDateChange={handleDateChange} 
            selectedDate={selectedDate} 
            matchCounter={getMatchCounter()} 
          />
        ) : (
          <div className="text-center mx-1 md:mx-2 w-full max-w-4xl">
            <div className="teletext-no-matches text-lg md:text-3xl mb-2 md:mb-4">
              NO FOOTBALL TODAY
            </div>
            <div className="teletext-suggestion text-base md:text-lg mb-4">
              GO OUTSIDE OR SOMETHING, I DON'T KNOW
            </div>
            
            {/* Use MatchDisplay component but hide the match info */}
            <MatchDisplay 
              match={{
                id: 'no-match',
                homeTeam: { name: 'NO', crest: '' },
                awayTeam: { name: 'MATCHES', crest: '' },
                kickoffTime: '',
                date: selectedDate.toISOString().split('T')[0],
                channel: { name: 'NO CHANNEL', logo: '' }
              }}
              onNextGame={handleNextGame} 
              onDateChange={handleDateChange} 
              selectedDate={selectedDate} 
              matchCounter=""
              hideMatchInfo={true}
            />
          </div>
        )}
      </div>

      <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
        OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
      </div>
    </div>;
};

export default Index;
