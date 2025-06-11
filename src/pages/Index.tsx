
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
          WHAT CHANNEL IS THE FOOTBALL ON?
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-medium">
          What channel the football is on today.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        {todaysMatch ? (
          <MatchDisplay match={todaysMatch} />
        ) : (
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              NO BIG MATCH TONIGHT
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">
              Maybe watch a film?
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-gray-500 text-sm">
        UK kick-off times • Major matches only
      </div>
    </div>
  );
};

export default Index;
