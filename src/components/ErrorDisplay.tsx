
interface ErrorDisplayProps {
  error: Error;
  onRetry: () => void;
}

const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto font-mono px-1 md:px-2 space-y-2 md:space-y-4 text-center">
      <div className="teletext-channel text-lg md:text-3xl py-2 md:py-4">
        ⚠️ TECHNICAL DIFFICULTIES
      </div>
      
      <div className="teletext-block text-sm md:text-lg py-2 md:py-3">
        UNABLE TO LOAD FOOTBALL DATA
      </div>
      
      <div className="teletext-time text-xs md:text-base py-1 md:py-2 text-red-300">
        {error.message}
      </div>
      
      <button
        onClick={onRetry}
        className="teletext-coffee text-sm md:text-xl py-2 md:py-3 w-full justify-center font-mono font-bold letter-spacing-1 border-0 bg-red-700 text-yellow-300 hover:bg-red-600 transition-colors"
      >
        🔄 TRY AGAIN
      </button>
      
      <div className="text-xs md:text-sm text-gray-400 py-2">
        CHECK YOUR INTERNET CONNECTION OR API KEY
      </div>
    </div>
  );
};

export default ErrorDisplay;
