import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CineCoveLogo } from "@/components/CineNestLogo";
import { User, LogOut, Settings } from "lucide-react";

interface NavigationProps {
  user: { id: number; isAdmin: boolean } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Navigation({ user, onLogin, onLogout }: NavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <CineCoveLogo />
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <span className={`text-sm font-medium transition-colors hover:text-cove-blue ${
                  location === "/" ? "text-cove-blue" : "text-muted-foreground"
                }`}>
                  Home
                </span>
              </Link>
              
              {user && (
                <Link href="/dashboard">
                  <span className={`text-sm font-medium transition-colors hover:text-cove-blue ${
                    location === "/dashboard" ? "text-cove-blue" : "text-muted-foreground"
                  }`}>
                    My Cove
                  </span>
                </Link>
              )}
              
              {user && user.isAdmin && (
                <Link href="/admin">
                  <span className={`text-sm font-medium transition-colors hover:text-amber-400 ${
                    location === "/admin" ? "text-amber-400" : "text-muted-foreground"
                  }`}>
                    Captain's Quarters
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-cove-blue" />
                  <span className="text-sm text-foreground">
                    {user.isAdmin ? "Captain" : "Sailor"}
                  </span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Leave Cove</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onLogin}
                className="bg-gradient-to-r from-cove-blue to-blue-500 hover:from-cove-blue/90 hover:to-blue-500/90 text-slate-900 font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-300/20"
              >
                🌊 Enter Cove
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}