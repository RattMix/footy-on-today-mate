
import MatchDisplay from "../components/MatchDisplay";
import LoadingDisplay from "../components/LoadingDisplay";
import ErrorDisplay from "../components/ErrorDisplay";
import { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import { type Match } from "../services/footballApi";

const Index = () => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: allMatches = [], isLoading, error, refetch } = useFootballData(selectedDate);

  console.log(`🎯 Index component state:`, { 
    allMatchesCount: allMatches.length, 
    isLoading, 
    error: error?.message,
    selectedDate: selectedDate.toISOString().split('T')[0]
  });

  const handleNextGame = () => {
    if (allMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIndex);
    setSelectedDate(new Date(allMatches[nextIndex].date));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    
    const matchIndex = allMatches.findIndex(match => match.date === dateString);
    if (matchIndex !== -1) {
      setCurrentMatchIndex(matchIndex);
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

  // Show loading state only initially, but with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <LoadingDisplay />
        </div>

        <div className="text-center py-2 md:py-4 flex-shrink-0">
          <a 
            href="https://buymeacoffee.com/footballchannel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="teletext-coffee text-sm hover:bg-purple-600 transition-colors inline-block py-2 md:py-2"
          >
            BUY ME A COFFEE (SITE COSTS MONEY)
          </a>
        </div>

        <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
          OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
        </div>
      </div>
    );
  }

  // Show error state but allow interaction
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <ErrorDisplay error={error as Error} onRetry={() => refetch()} />
        </div>

        <div className="text-center py-2 md:py-4 flex-shrink-0">
          <a 
            href="https://buymeacoffee.com/footballchannel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="teletext-coffee text-sm hover:bg-purple-600 transition-colors inline-block py-2 md:py-2"
          >
            BUY ME A COFFEE (SITE COSTS MONEY)
          </a>
        </div>

        <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
          OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
        </div>
      </div>
    );
  }

  // Main content logic - this should always show even with no matches
  const currentMatch = allMatches[currentMatchIndex];
  const hasMatchToShow = currentMatch && selectedDateMatches.length > 0;
  const isCurrentMatchOnSelectedDate = currentMatch?.date === selectedDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
        <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
          WHAT CHANNEL IS THE FOOTBALL ON
        </div>
      </div>

      <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
        {hasMatchToShow && isCurrentMatchOnSelectedDate ? (
          <MatchDisplay 
            match={currentMatch} 
            onNextGame={handleNextGame}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
            matchCounter={getMatchCounter()}
          />
        ) : selectedDateMatches.length > 0 ? (
          <MatchDisplay 
            match={selectedDateMatches[0]} 
            onNextGame={handleNextGame}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
            matchCounter={getMatchCounter()}
          />
        ) : (
          <div className="text-center mx-1 md:mx-2 w-full max-w-4xl">
            <div className="teletext-channel text-lg md:text-3xl mb-2 md:mb-4">
              NO FOOTBALL TODAY
            </div>
            <div className="teletext-block text-base md:text-lg mb-4">
              WATCH SOMETHING ELSE MATE
            </div>
            
            <div className="w-full max-w-4xl mx-auto font-mono px-1 md:px-2 space-y-2 md:space-y-4">
              <div className="flex flex-col space-y-2 md:space-y-3">
                <div className="teletext-date text-sm md:text-xl py-2 md:py-3">
                  📅 {selectedDate.toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  }).toUpperCase()}
                </div>

                <button
                  onClick={handleNextGame}
                  disabled={allMatches.length === 0}
                  className="teletext-coffee text-sm md:text-xl py-2 md:py-3 w-full justify-center font-mono font-bold letter-spacing-1 border-0 bg-purple-700 text-yellow-300 hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {allMatches.length === 0 ? 'NO MATCHES AVAILABLE' : 'NEXT GAME →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-2 md:py-4 flex-shrink-0">
        <a 
          href="https://buymeacoffee.com/footballchannel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="teletext-coffee text-sm hover:bg-purple-600 transition-colors inline-block py-2 md:py-2"
        >
          BUY ME A COFFEE (SITE COSTS MONEY)
        </a>
      </div>

      <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
        OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
      </div>
    </div>
  );
};

export default Index;
