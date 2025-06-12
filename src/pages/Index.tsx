
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

  const handleNextGame = () => {
    if (allMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIndex);
    // Update selected date to match the new game's date
    setSelectedDate(new Date(allMatches[nextIndex].date));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    
    // Find first match on selected date
    const matchIndex = allMatches.findIndex(match => match.date === dateString);
    if (matchIndex !== -1) {
      setCurrentMatchIndex(matchIndex);
    }
  };

  // Get matches for the selected date
  const getMatchesForDate = (date: Date): Match[] => {
    const dateString = date.toISOString().split('T')[0];
    return allMatches.filter(match => match.date === dateString);
  };

  const selectedDateMatches = getMatchesForDate(selectedDate);
  
  // Get match counter - only show if there are matches on the selected date
  const getMatchCounter = () => {
    if (selectedDateMatches.length === 0) {
      return "";
    }
    
    // Check if current match is on the selected date
    const currentMatch = allMatches[currentMatchIndex];
    const currentMatchDate = currentMatch?.date;
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    if (currentMatchDate !== selectedDateString) {
      // Current match is not on selected date, show total for selected date
      return `${selectedDateMatches.length} MATCH${selectedDateMatches.length !== 1 ? 'ES' : ''} TODAY`;
    }
    
    // Current match is on selected date, show position
    const currentMatchInDay = selectedDateMatches.findIndex(match => match.id === currentMatch?.id);
    return `GAME ${currentMatchInDay + 1} OF ${selectedDateMatches.length}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        {/* Header */}
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        {/* Loading content */}
        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <LoadingDisplay />
        </div>

        {/* Footer */}
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
        {/* Header */}
        <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
          <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
            WHAT CHANNEL IS THE FOOTBALL ON
          </div>
        </div>

        {/* Error content */}
        <div className="px-1 md:px-2 py-2 md:py-4 flex-grow md:flex md:items-center md:justify-center">
          <ErrorDisplay error={error as Error} onRetry={() => refetch()} />
        </div>

        {/* Footer */}
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

  // Main content logic
  const currentMatch = allMatches[currentMatchIndex];
  const hasMatchToShow = currentMatch && selectedDateMatches.length > 0;
  const isCurrentMatchOnSelectedDate = currentMatch?.date === selectedDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Simple teletext-style header */}
      <div className="text-center py-2 md:py-6 px-1 md:px-2 flex-shrink-0">
        <div className="teletext-block text-base md:text-4xl inline-block py-2 md:py-4">
          WHAT CHANNEL IS THE FOOTBALL ON
        </div>
      </div>

      {/* Main content - natural flow on mobile, centered on desktop */}
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
          // Show first match of selected date if current match isn't on this date
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
            
            {/* Date picker for no-match days */}
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
                  NEXT GAME →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buy me a coffee - teletext style with new distinctive class */}
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

      {/* Simple footer */}
      <div className="text-center py-2 md:py-2 text-foreground text-xs bg-background flex-shrink-0">
        OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
      </div>
    </div>
  );
};

export default Index;
