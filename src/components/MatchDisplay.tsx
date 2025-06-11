
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
    <div className="max-w-4xl mx-auto font-mono px-2">
      {/* Channel info - most prominent, deliberately clunky */}
      <div className="text-center mb-6">
        <div className="hokey-border bg-primary text-primary-foreground amateur-spacing inline-block mb-2">
          <div className="text-xs font-bold clunky-text mb-1">
            *** WATCH ON ***
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src={match.channel.logo} 
              alt={match.channel.name}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
              onError={handleImageError}
            />
          </div>
          <div className="text-lg md:text-2xl font-bold clunky-text">
            {match.channel.name}
          </div>
        </div>
      </div>

      {/* Teams - basic table-like layout */}
      <div className="text-center mb-6">
        <div className="hokey-border bg-background amateur-spacing inline-block">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <TeamCrest 
              name={match.homeTeam.name} 
              crest={match.homeTeam.crest} 
            />
            
            <div className="hokey-border bg-primary text-primary-foreground amateur-spacing">
              <div className="text-lg md:text-2xl font-bold clunky-text">
                VS
              </div>
            </div>
            
            <TeamCrest 
              name={match.awayTeam.name} 
              crest={match.awayTeam.crest} 
            />
          </div>
        </div>
      </div>

      {/* Kick-off time - basic and functional */}
      <div className="text-center">
        <div className="hokey-border bg-primary text-primary-foreground amateur-spacing inline-block">
          <div className="text-xs font-bold clunky-text mb-1">
            {match.isLive ? `${'>>>'} LIVE NOW ${'<<<'}` : "KICK OFF TIME:"}
          </div>
          <div className="text-2xl md:text-3xl font-bold clunky-text">
            {match.kickoffTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDisplay;
