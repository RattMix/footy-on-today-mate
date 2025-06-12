
interface Team {
  name: string;
  crest: string;
}

interface Channel {
  name: string;
  logo: string;
}

interface Match {
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  channel: Channel;
  isLive?: boolean;
}

interface MatchDisplayProps {
  match: Match;
}

const MatchDisplay = ({ match }: MatchDisplayProps) => {
  return (
    <div className="max-w-4xl mx-auto font-mono px-2 space-y-2 md:space-y-4">
      {/* Channel - the star of the show */}
      <div className="teletext-channel text-lg md:text-4xl py-2 md:py-4">
        📺 {match.channel.name}
      </div>

      {/* Teams - simple block */}
      <div className="teletext-teams text-sm md:text-2xl py-1 md:py-3">
        ⚽ {match.homeTeam.name} VS {match.awayTeam.name} ⚽
      </div>

      {/* Kick-off time */}
      <div className="teletext-time text-base md:text-2xl py-1 md:py-3">
        {match.isLive ? "🔴 LIVE NOW" : `⏰ KICK OFF: ${match.kickoffTime}`}
      </div>
    </div>
  );
};

export default MatchDisplay;
