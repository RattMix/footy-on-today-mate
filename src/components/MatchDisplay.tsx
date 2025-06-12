
import TeamCrest from "./TeamCrest";

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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="text-2xl">📺</div>';
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-mono px-2 space-y-6">
      {/* Channel - the star of the show */}
      <div className="text-center">
        <div className="teletext-channel text-2xl md:text-4xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src={match.channel.logo} 
              alt={match.channel.name}
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              onError={handleImageError}
            />
            <span>{match.channel.name}</span>
          </div>
        </div>
      </div>

      {/* Teams - simple one line */}
      <div className="text-center">
        <div className="teletext-teams text-lg md:text-2xl">
          <div className="flex items-center justify-center gap-4">
            <img 
              src={match.homeTeam.crest} 
              alt={match.homeTeam.name}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-lg">⚽</div>';
                }
              }}
            />
            <span>{match.homeTeam.name}</span>
            <span className="mx-2">VS</span>
            <span>{match.awayTeam.name}</span>
            <img 
              src={match.awayTeam.crest} 
              alt={match.awayTeam.name}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-lg">⚽</div>';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Kick-off time - clean and minimal */}
      <div className="text-center">
        <div className="teletext-time text-xl md:text-2xl">
          {match.isLive ? "LIVE NOW" : `KICK OFF: ${match.kickoffTime}`}
        </div>
      </div>
    </div>
  );
};

export default MatchDisplay;
