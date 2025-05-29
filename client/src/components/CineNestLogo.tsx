import { Play, Sparkles } from "lucide-react";

export function CineNestLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Main logo container with cozy gradient */}
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 transform">
          <Play className="text-white h-5 w-5 fill-current ml-0.5" />
        </div>
        {/* Decorative sparkle */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="text-white h-2 w-2 fill-current" />
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-600/20 rounded-2xl blur-sm -z-10"></div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight">
          CineNest
        </h1>
        <p className="text-xs text-amber-400/70 -mt-1 font-medium">Your cozy watchlist</p>
      </div>
    </div>
  );
}
