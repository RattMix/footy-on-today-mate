
import { Skeleton } from "@/components/ui/skeleton";

const LoadingDisplay = () => {
  return (
    <div className="w-full max-w-4xl mx-auto font-mono px-1 md:px-2 space-y-2 md:space-y-4">
      {/* Channel skeleton */}
      <div className="teletext-channel text-lg md:text-4xl py-2 md:py-4">
        <Skeleton className="h-8 md:h-12 w-3/4 mx-auto bg-yellow-300/20" />
      </div>

      {/* Teams skeleton */}
      <div className="teletext-teams text-sm md:text-2xl py-2 md:py-3">
        <Skeleton className="h-6 md:h-8 w-2/3 mx-auto bg-green-300/20" />
      </div>

      {/* Time skeleton */}
      <div className="teletext-time text-base md:text-2xl py-2 md:py-3">
        <Skeleton className="h-6 md:h-8 w-1/2 mx-auto bg-blue-300/20" />
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col space-y-2 md:space-y-3">
        <Skeleton className="h-10 md:h-12 w-full bg-emerald-700/20" />
        <Skeleton className="h-6 md:h-8 w-1/3 mx-auto bg-white/20" />
        <Skeleton className="h-10 md:h-12 w-full bg-purple-700/20" />
      </div>

      <div className="text-center text-yellow-300 text-sm md:text-lg py-2">
        📡 LOADING FOOTBALL DATA...
      </div>
    </div>
  );
};

export default LoadingDisplay;
