import { Film, Home } from "lucide-react";

export function CineNestLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 gradient-warm rounded-xl flex items-center justify-center shadow-lg">
          <Film className="text-[hsl(var(--dark-primary))] h-5 w-5" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--warm-brown))] rounded-full flex items-center justify-center">
          <Home className="text-[hsl(var(--dark-primary))] h-2.5 w-2.5" />
        </div>
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--warm-amber))] to-[hsl(var(--warm-orange))] bg-clip-text text-transparent">
        CineNest
      </h1>
    </div>
  );
}
