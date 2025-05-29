import { Waves, Shell } from "lucide-react";

export function CineCoveLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Main logo container with ocean gradient */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Waves className="text-white h-5 w-5" />
        </div>
        {/* Decorative shell */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center">
          <Shell className="text-white h-2 w-2" />
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 w-10 h-10 bg-blue-500/20 rounded-xl blur-sm -z-10"></div>
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent leading-tight">
        CineCove
      </h1>
    </div>
  );
}
