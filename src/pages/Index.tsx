
import MatchDisplay from "../components/MatchDisplay";

const Index = () => {
  // Mock data - in real app this would come from an API
  const todaysMatch = {
    homeTeam: {
      name: "England",
      crest: "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    },
    awayTeam: {
      name: "Spain",
      crest: "🇪🇸"
    },
    kickoffTime: "20:00",
    channel: {
      name: "BBC One",
      logo: "📺"
    },
    isLive: true
  };

  // For when no major match is on
  const noMatch = null;

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="text-center py-6 px-4 border-b-2 border-white">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wider mb-1">
          WHAT CHANNEL IS THE FOOTBALL ON
        </h1>
        <div className="text-base md:text-lg text-white bg-black px-4 py-1 inline-block border border-white mt-2">
          TODAY'S MATCH INFORMATION
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {todaysMatch ? (
          <MatchDisplay match={todaysMatch} />
        ) : (
          <div className="text-center border-4 border-white bg-black p-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              NO MAJOR MATCH SCHEDULED
            </h2>
            <div className="text-lg md:text-xl border border-white px-4 py-2 inline-block">
              ALTERNATIVE: WATCH FILM
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-3 text-white text-xs border-t border-white bg-black">
        UK TIMES • MAJOR MATCHES ONLY • UPDATED DAILY
      </div>
    </div>
  );
};

export default Index;
