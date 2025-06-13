
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface MatchDisplayProps {
  match: Match;
  onNextGame: () => void;
  onDateChange: (date: Date | undefined) => void;
  selectedDate: Date;
  matchCounter: string;
  hideMatchInfo?: boolean;
}

const MatchDisplay = ({ match, onNextGame, onDateChange, selectedDate, matchCounter, hideMatchInfo = false }: MatchDisplayProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto font-mono px-1 md:px-2 space-y-2 md:space-y-4">
      {/* Show match info only if hideMatchInfo is false */}
      {!hideMatchInfo && (
        <>
          {/* Channel - the star of the show */}
          <div className="teletext-channel text-lg md:text-4xl py-2 md:py-4">
            📺 {match.channel.name}
          </div>

          {/* Teams - simple block */}
          <div className="teletext-teams text-sm md:text-2xl py-2 md:py-3">
            ⚽ {match.homeTeam.name} VS {match.awayTeam.name} ⚽
          </div>

          {/* Kick-off time */}
          <div className="teletext-time text-base md:text-2xl py-2 md:py-3">
            {match.isLive ? "🔴 LIVE NOW" : `⏰ KICK OFF: ${match.kickoffTime}`}
          </div>
        </>
      )}

      {/* Date Picker and Controls - always visible */}
      <div className="flex flex-col space-y-2 md:space-y-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "teletext-date text-sm md:text-xl py-2 md:py-3 w-full justify-center font-mono font-bold letter-spacing-1 border-0",
                "bg-blue-600 text-yellow-300 hover:bg-blue-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 md:h-6 md:w-6" />
              📅 {format(selectedDate, "EEEE dd MMMM yyyy").toUpperCase()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background border-foreground" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto bg-background text-foreground")}
            />
          </PopoverContent>
        </Popover>

        {/* Match Counter - only show if there's content */}
        {matchCounter && (
          <div className="teletext-info text-xs md:text-lg py-1 md:py-2">
            {matchCounter}
          </div>
        )}

        {/* Next Game Button - always visible */}
        <Button
          onClick={onNextGame}
          className={cn(
            "teletext-action text-sm md:text-xl py-2 md:py-3 w-full justify-center font-mono font-bold letter-spacing-1 border-0",
            "bg-green-600 text-black hover:bg-green-500"
          )}
        >
          NEXT GAME <ChevronRight className="ml-2 h-4 w-4 md:h-6 md:w-6" />
        </Button>

        {/* Buy Me A Coffee - placed right after Next Game button */}
        <a 
          href="https://buymeacoffee.com/footballchannel" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="teletext-footer text-sm md:text-xl py-2 md:py-3 hover:bg-red-600 transition-colors inline-block w-full text-center font-mono font-bold letter-spacing-1"
        >
          BUY ME A COFFEE (SITE COSTS MONEY)
        </a>
      </div>
    </div>
  );
};

export default MatchDisplay;
