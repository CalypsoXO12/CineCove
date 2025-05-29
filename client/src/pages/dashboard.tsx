import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CineNestLogo } from "@/components/CineNestLogo";
import { StatsOverview } from "@/components/StatsOverview";
import { SearchFilters } from "@/components/SearchFilters";
import { MediaCard } from "@/components/MediaCard";
import { AddMediaModal } from "@/components/AddMediaModal";
import { mediaApi } from "@/lib/api";
import type { MediaItem } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

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
            <CineNestLogo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-[hsl(var(--warm-amber))] font-medium border-b-2 border-[hsl(var(--warm-amber))] pb-1">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground hover:text-[hsl(var(--warm-amber))] transition-colors">
                Statistics
              </a>
              <a href="#" className="text-muted-foreground hover:text-[hsl(var(--warm-amber))] transition-colors">
                Settings
              </a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setAddModalOpen(true)}
                className="gradient-warm text-[hsl(var(--dark-primary))] font-medium transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Media</span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--warm-orange))] to-[hsl(var(--warm-brown))] rounded-full flex items-center justify-center">
                <User className="text-[hsl(var(--dark-primary))] h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back to your nest</h2>
          <p className="text-muted-foreground">Track your cinematic journey across movies, TV shows, and anime</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-[2/3] bg-muted"></div>
              </div>
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchQuery || activeType !== "all" || activeStatus !== "all" 
                ? "No media items found matching your filters" 
                : "Your watchlist is empty"}
            </div>
            <Button 
              onClick={() => setAddModalOpen(true)}
              className="gradient-warm text-[hsl(var(--dark-primary))] font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {mediaItems.map((item: MediaItem) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setAddModalOpen(true)}
          size="lg"
          className="w-14 h-14 gradient-warm rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center p-0"
        >
          <Plus className="text-[hsl(var(--dark-primary))] h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border z-40">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-4 text-[hsl(var(--warm-amber))]">
            <div className="text-xl mb-1">🏠</div>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <div className="text-xl mb-1">🔍</div>
            <span className="text-xs">Search</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <div className="text-xl mb-1">📊</div>
            <span className="text-xs">Stats</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <div className="text-xl mb-1">👤</div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Add Media Modal */}
      <AddMediaModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
