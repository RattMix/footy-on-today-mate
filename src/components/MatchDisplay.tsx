
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
  return (
    <div className="w-full max-w-3xl mx-auto font-mono">
      {/* Teams */}
      <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
        <TeamCrest 
          name={match.homeTeam.name} 
          crest={match.homeTeam.crest} 
        />
        
        <div className="border-2 border-white bg-black px-4 py-2">
          <div className="text-lg md:text-2xl font-bold text-white">
            VS
          </div>
        </div>
        
        <TeamCrest 
          name={match.awayTeam.name} 
          crest={match.awayTeam.crest} 
        />
      </div>

      {/* Match Info */}
      <div className="text-center space-y-4">
        {/* Kick-off Time */}
        <div className="border-4 border-white bg-white text-black py-3 px-6 inline-block">
          <div className="text-xs font-bold uppercase tracking-widest mb-1">
            {match.isLive ? "LIVE NOW" : "KICK OFF"}
          </div>
          <div className="text-3xl md:text-4xl font-bold">
            {match.kickoffTime}
          </div>
        </div>

        {/* Channel */}
        <div className="border-4 border-white bg-white text-black inline-block">
          <div className="py-4 px-8">
            <div className="text-xs font-bold uppercase tracking-widest mb-2">
              CHANNEL
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{match.channel.logo}</span>
              <span className="text-2xl md:text-3xl font-bold">
                {match.channel.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDisplay;
