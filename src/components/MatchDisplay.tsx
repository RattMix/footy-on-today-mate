
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Teams */}
      <div className="flex items-center justify-center gap-8 md:gap-16 mb-8">
        <TeamCrest 
          name={match.homeTeam.name} 
          crest={match.homeTeam.crest} 
        />
        
        <div className="text-4xl md:text-6xl font-black text-gray-400">
          VS
        </div>
        
        <TeamCrest 
          name={match.awayTeam.name} 
          crest={match.awayTeam.crest} 
        />
      </div>

      {/* Match Info */}
      <div className="text-center space-y-6">
        {/* Kick-off Time */}
        <div className="bg-white text-black py-4 px-8 inline-block">
          <div className="text-sm font-bold uppercase tracking-wide mb-1">
            {match.isLive ? "LIVE NOW" : "KICK-OFF"}
          </div>
          <div className="text-4xl md:text-5xl font-black">
            {match.kickoffTime}
          </div>
        </div>

        {/* Channel */}
        <div className="border-4 border-white inline-block">
          <div className="bg-white text-black py-6 px-12">
            <div className="text-sm font-bold uppercase tracking-wide mb-2">
              WATCH ON
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">{match.channel.logo}</span>
              <span className="text-3xl md:text-4xl font-black">
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
