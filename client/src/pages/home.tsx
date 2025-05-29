import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp, Star, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CineCoveLogo } from "@/components/CineNestLogo";
import { MediaCard } from "@/components/MediaCard";
import { AddMediaModal } from "@/components/AddMediaModal";
import { mediaApi } from "@/lib/api";
import type { MediaItem, Announcement, UpcomingRelease } from "@shared/schema";

export default function Home() {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: featuredItems = [], isLoading } = useQuery({
    queryKey: ["/api/media", { status: "watching" }],
    queryFn: () => mediaApi.getMediaItems({ status: "watching" }),
  });

  const { data: recentlyAdded = [] } = useQuery({
    queryKey: ["/api/media", { recent: true }],
    queryFn: () => mediaApi.getMediaItems(),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: () => fetch("/api/announcements").then(res => res.json()),
  });

  const { data: upcomingReleases = [] } = useQuery({
    queryKey: ["/api/upcoming"],
    queryFn: () => fetch("/api/upcoming").then(res => res.json()),
  });

  return (
    <div className="min-h-screen bg-background pb-mobile-nav">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <CineCoveLogo />
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-purple-400 font-medium border-b-2 border-purple-400 pb-1">
                  Home
                </Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin" className="text-muted-foreground hover:text-purple-400 transition-colors">
                  Admin
                </Link>
              </nav>
              <Button 
                onClick={() => setAddModalOpen(true)}
                className="gradient-purple text-white font-medium transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Media</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Discover Your Next
            <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent"> Obsession</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track movies, TV shows, and anime. Build your personal watchlist and never miss a great story.
          </p>
          <Button 
            onClick={() => setAddModalOpen(true)}
            size="lg"
            className="gradient-purple text-white font-medium px-8 py-4 text-lg"
          >
            Start Your Collection
          </Button>
        </section>

        {/* Top Banner Ad */}
        <div className="mb-12 bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-muted-foreground text-sm mb-2">Advertisement</div>
          <div className="h-20 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">728x90 Ad Space</span>
          </div>
        </div>

        {/* Admin Announcements */}
        {announcements.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                  <Calendar className="text-white h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Latest Updates</h2>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement: Announcement) => (
                  <div key={announcement.id} className="bg-card/50 rounded-lg p-4 border border-border/50">
                    <h3 className="font-semibold text-foreground mb-2">{announcement.title}</h3>
                    <p className="text-muted-foreground text-sm">{announcement.content}</p>
                    <span className="text-xs text-purple-400 mt-2 block">
                      {new Date(announcement.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex gap-8">
          {/* Sidebar Ad */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-4 text-center sticky top-24">
              <div className="text-muted-foreground text-xs mb-2">Advertisement</div>
              <div className="h-96 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">160x600 Ad Space</span>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="flex-1">
            {/* Upcoming Anticipated Releases */}
            <section className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                  <Clock className="text-white h-4 w-4" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
              </div>
              
              <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {upcomingReleases.slice(0, 8).map((release: UpcomingRelease) => (
                  <div key={release.id} className="bg-card rounded-2xl overflow-hidden border border-border hover:border-purple-500/50 transition-all duration-300 group">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img 
                        src={release.posterUrl || "/placeholder-poster.jpg"} 
                        alt={release.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {release.isHighlighted && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-xs font-medium">
                          {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : 'TBA'}
                        </p>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{release.title}</h3>
                      <p className="text-muted-foreground text-xs capitalize">{release.type}</p>
                      {release.description && (
                        <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{release.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Admin Picks */}
            <section className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                  <Star className="text-white h-4 w-4 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Admin Picks</h2>
              </div>
              
              {isLoading ? (
                <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                      <div className="aspect-[2/3] bg-muted"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {featuredItems.slice(0, 4).map((item: MediaItem) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>

            {/* Trending Now */}
            <section className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 gradient-purple-soft rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white h-4 w-4" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
              </div>
              
              <div className="grid mobile-card-grid sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {recentlyAdded.slice(0, 8).map((item: MediaItem) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Bottom Ad */}
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-muted-foreground text-sm mb-2">Advertisement</div>
              <div className="h-24 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">728x90 Ad Space</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 safe-area-inset-bottom">
        <div className="flex justify-around py-3 px-2">
          <button className="flex flex-col items-center py-2 px-3 text-purple-400 mobile-touch rounded-xl bg-purple-400/10">
            <div className="text-lg mb-1">🏠</div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-muted-foreground mobile-touch rounded-xl hover:bg-muted/50 transition-colors">
            <div className="text-lg mb-1">🔍</div>
            <span className="text-xs">Browse</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-muted-foreground mobile-touch rounded-xl hover:bg-muted/50 transition-colors">
            <div className="text-lg mb-1">📝</div>
            <span className="text-xs">List</span>
          </button>
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