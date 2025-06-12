
import MatchDisplay from "../components/MatchDisplay";
import { useState } from "react";

interface Team {
  name: string;
  crest: string;
}

interface Channel {
  name: string;
  logo: string;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  date: string;
  channel: Channel;
  isLive?: boolean;
}

const Index = () => {
  // Enhanced matches data with multiple games across different days
  const allMatches: Match[] = [
    {
      id: "1",
      homeTeam: {
        name: "MANCHESTER UNITED",
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png"
      },
      awayTeam: {
        name: "LIVERPOOL", 
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png"
      },
      kickoffTime: "17:30",
      date: "2025-06-12",
      channel: {
        name: "SKY SPORTS PREMIER LEAGUE",
        logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
      },
      isLive: false
    },
    {
      id: "2",
      homeTeam: {
        name: "ARSENAL",
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png"
      },
      awayTeam: {
        name: "CHELSEA", 
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png"
      },
      kickoffTime: "20:00",
      date: "2025-06-12",
      channel: {
        name: "BT SPORT 1",
        logo: "https://1000logos.net/wp-content/uploads/2021/05/BT-Sport-logo.png"
      },
      isLive: false
    },
    {
      id: "3",
      homeTeam: {
        name: "MANCHESTER CITY",
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png"
      },
      awayTeam: {
        name: "TOTTENHAM", 
        crest: "https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png"
      },
      kickoffTime: "14:00",
      date: "2025-06-13",
      channel: {
        name: "SKY SPORTS MAIN EVENT",
        logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
      },
      isLive: false
    }
  ];

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const currentMatch = allMatches[currentMatchIndex];

  const handleNextGame = () => {
    const nextIndex = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIndex);
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

  const getTodaysMatchCount = () => {
    const today = selectedDate.toISOString().split('T')[0];
    return allMatches.filter(match => match.date === today).length;
  };

  const getCurrentMatchNumber = () => {
    const today = selectedDate.toISOString().split('T')[0];
    const todaysMatches = allMatches.filter(match => match.date === today);
    const currentMatchInDay = todaysMatches.findIndex(match => match.id === currentMatch?.id);
    return currentMatchInDay + 1;
  };

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
        {currentMatch ? (
          <MatchDisplay 
            match={currentMatch} 
            onNextGame={handleNextGame}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
            matchCounter={`GAME ${getCurrentMatchNumber()} OF ${getTodaysMatchCount()}`}
          />
        ) : (
          <div className="text-center mx-1 md:mx-2">
            <div className="teletext-channel text-lg md:text-3xl mb-2 md:mb-4">
              NO FOOTBALL TODAY
            </div>
            <div className="teletext-block text-base md:text-lg">
              WATCH SOMETHING ELSE MATE
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
