import { Play, Star } from "lucide-react";

export function CineNestLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Main logo container with purple gradient */}
        <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center shadow-lg">
          <Play className="text-white h-5 w-5 fill-current ml-0.5" />
        </div>
        {/* Decorative star */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
          <Star className="text-white h-2 w-2 fill-current" />
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 w-10 h-10 bg-purple-500/20 rounded-xl blur-sm -z-10"></div>
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent leading-tight">
        CineNest
      </h1>
    </div>
  );
}
