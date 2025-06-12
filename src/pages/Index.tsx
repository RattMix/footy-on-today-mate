import MatchDisplay from "../components/MatchDisplay";

const Index = () => {
  // Basic football data - now with reliable logo URLs and fallbacks
  const todaysMatch = {
    homeTeam: {
      name: "MANCHESTER UNITED",
      crest: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png"
    },
    awayTeam: {
      name: "LIVERPOOL", 
      crest: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png"
    },
    kickoffTime: "17:30",
    channel: {
      name: "SKY SPORTS PREMIER LEAGUE",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Sky-Sports-logo.png"
    },
    isLive: false
  };

  const noMatch = null;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Simple teletext-style header */}
      <div className="text-center py-6 px-2">
        <div className="teletext-block text-2xl md:text-4xl inline-block">
          WHAT CHANNEL IS THE FOOTBALL ON
        </div>
      </div>

      {/* Main content - clean teletext layout */}
      <div className="px-2 py-4">
        {todaysMatch ? (
          <MatchDisplay match={todaysMatch} />
        ) : (
          <div className="text-center mx-2">
            <div className="teletext-channel text-xl md:text-3xl mb-4">
              NO FOOTBALL TODAY
            </div>
            <div className="teletext-block text-base md:text-lg">
              WATCH SOMETHING ELSE MATE
            </div>
          </div>
        )}
      </div>

      {/* Buy me a coffee - teletext style */}
      <div className="text-center py-4">
        <a 
          href="https://buymeacoffee.com/footballchannel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="teletext-time text-xs hover:bg-yellow-600 transition-colors inline-block"
        >
          BUY ME A COFFEE (SITE COSTS MONEY)
        </a>
      </div>

      {/* Simple footer */}
      <div className="text-center py-2 text-foreground text-xs bg-background">
        OH YOUR TEAM IS NOT ON HERE, BOO HOO - ONLY BIG MATCHES MATE
      </div>
    </div>
  );
};

export default Index;
