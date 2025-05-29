import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CineCoveLogo } from "@/components/CineNestLogo";
import { SearchFilters } from "@/components/SearchFilters";
import { MediaCard } from "@/components/MediaCard";
import { AddMediaModal } from "@/components/AddMediaModal";
import { mediaApi } from "@/lib/api";
import type { MediaItem } from "@shared/schema";

interface DashboardProps {
  user: { id: number; isAdmin: boolean } | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Redirect non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Your Cove</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your personal media collection</p>
        </div>
      </div>
    );
  }

  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ["/api/media", { 
      search: searchQuery || undefined,
      type: activeType !== "all" ? activeType : undefined,
      status: activeStatus !== "all" ? activeStatus : undefined,
    }],
    queryFn: () => mediaApi.getMediaItems({
      search: searchQuery || undefined,
      type: activeType !== "all" ? activeType : undefined,
      status: activeStatus !== "all" ? activeStatus : undefined,
    }),
  });

  return (
    <div className="min-h-screen bg-background pb-mobile-nav">
      {/* Header Navigation */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <CineCoveLogo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-muted-foreground hover:text-purple-400 transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-purple-400 font-medium border-b-2 border-purple-400 pb-1">
                Dashboard
              </Link>
              <a href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
                Browse
              </a>
              <Link href="/admin" className="text-muted-foreground hover:text-purple-400 transition-colors">
                Admin
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setAddModalOpen(true)}
                className="gradient-purple text-white font-medium transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Media</span>
              </Button>
              <div className="w-8 h-8 gradient-purple-soft rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Watchlist</h2>
          <p className="text-muted-foreground">Discover and track movies, TV shows, and anime</p>
        </div>

        {/* Top Banner Ad Space */}
        <div className="mb-8 bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-muted-foreground text-sm mb-2">Advertisement</div>
          <div className="h-20 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">728x90 Ad Space</span>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeType={activeType}
          onTypeChange={setActiveType}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-[2/3] bg-muted"></div>
              </div>
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12 mobile-spacing">
            <div className="text-muted-foreground mb-6 text-sm md:text-base">
              {searchQuery || activeType !== "all" || activeStatus !== "all" 
                ? "No media items found matching your filters" 
                : "Your cove is calm and quiet... for now."}
            </div>
            <Button 
              onClick={() => setAddModalOpen(true)}
              className="gradient-cove text-white font-medium mobile-touch"
            >
              <Plus className="h-4 w-4 mr-2" />
              Begin Curating
            </Button>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Sidebar Ad Space */}
            <div className="hidden lg:block w-60 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-4 text-center sticky top-24">
                <div className="text-muted-foreground text-xs mb-2">Advertisement</div>
                <div className="h-96 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">160x600 Ad Space</span>
                </div>
              </div>
            </div>
            
            {/* Media Grid */}
            <div className="flex-1">
              <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
                {mediaItems.map((item: MediaItem) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
              
              {/* Bottom Ad Space */}
              <div className="bg-card border border-border rounded-xl p-6 text-center mt-8">
                <div className="text-muted-foreground text-sm mb-2">Advertisement</div>
                <div className="h-24 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">728x90 Ad Space</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setAddModalOpen(true)}
          size="lg"
          className="w-14 h-14 gradient-purple rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center p-0"
        >
          <Plus className="text-white h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 safe-area-inset-bottom">
        <div className="flex justify-around py-3 px-2">
          <Link href="/" className="flex flex-col items-center py-2 px-3 text-muted-foreground mobile-touch rounded-xl hover:bg-muted/50 transition-colors">
            <div className="text-lg mb-1">🏠</div>
            <span className="text-xs">Home</span>
          </Link>
          <button className="flex flex-col items-center py-2 px-3 text-muted-foreground mobile-touch rounded-xl hover:bg-muted/50 transition-colors">
            <div className="text-lg mb-1">🔍</div>
            <span className="text-xs">Browse</span>
          </button>
          <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-purple-400 mobile-touch rounded-xl bg-purple-400/10">
            <div className="text-lg mb-1">📝</div>
            <span className="text-xs font-medium">List</span>
          </Link>
          <button className="flex flex-col items-center py-2 px-3 text-muted-foreground mobile-touch rounded-xl hover:bg-muted/50 transition-colors">
            <div className="text-lg mb-1">👤</div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Add Media Modal */}
      <AddMediaModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
