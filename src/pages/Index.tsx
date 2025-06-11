
import MatchDisplay from "../components/MatchDisplay";

const Index = () => {
  // Basic football data - now with demo logos that actually work
  const todaysMatch = {
    homeTeam: {
      name: "MANCHESTER UNITED",
      crest: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=center"
    },
    awayTeam: {
      name: "LIVERPOOL", 
      crest: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=100&h=100&fit=crop&crop=center"
    },
    kickoffTime: "17:30",
    channel: {
      name: "SKY SPORTS PREMIER LEAGUE",
      logo: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&h=100&fit=crop&crop=center"
    },
    isLive: false
  };

  const noMatch = null;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Deliberately amateur header */}
      <div className="text-center py-4 px-2 hokey-border border-b-0">
        <h1 className="text-2xl md:text-4xl font-bold tracking-wider mb-2 clunky-text">
          *** WHAT CHANNEL IS THE FOOTBALL ON ***
        </h1>
        <div className="text-sm md:text-base bg-primary text-primary-foreground amateur-spacing inline-block hokey-border mt-1">
          FOOTBALL IS ON HERE:
        </div>
      </div>

      {/* Main content - deliberately basic layout */}
      <div className="px-2 py-4">
        {todaysMatch ? (
          <MatchDisplay match={todaysMatch} />
        ) : (
          <div className="text-center hokey-border bg-background amateur-spacing mx-2">
            <h2 className="text-xl md:text-3xl font-bold mb-3 clunky-text">
              {'>>>'} NO FOOTBALL TODAY {'<<<'}
            </h2>
            <div className="text-base md:text-lg hokey-border bg-primary text-primary-foreground amateur-spacing inline-block">
              WATCH SOMETHING ELSE MATE
            </div>
          </div>
        )}
      </div>

      {/* Buy me a coffee - keeping it hokey */}
      <div className="text-center py-2">
        <a 
          href="https://buymeacoffee.com/footballchannel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hokey-border bg-primary text-primary-foreground amateur-spacing inline-block clunky-text text-xs hover:bg-background hover:text-foreground transition-colors"
        >
          *** BUY ME A COFFEE *** (SITE COSTS MONEY)
        </a>
      </div>

      {/* Basic footer */}
      <div className="text-center py-2 text-foreground text-xs hokey-border border-t-0 bg-background">
        OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
      </div>
    </div>
  );
};

export default Index;
