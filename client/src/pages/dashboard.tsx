import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, User, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CineCoveLogo } from "@/components/CineNestLogo";
import { SearchFilters } from "@/components/SearchFilters";
import { MediaCard } from "@/components/MediaCard";
import { AddMediaModal } from "@/components/AddMediaModal";
import { mediaApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { MediaItem } from "@shared/schema";

interface DashboardProps {
  user: { id: number; isAdmin: boolean } | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const { toast } = useToast();

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

  // Update media item mutation
  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MediaItem> }) => {
      const response = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update media item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media updated successfully" });
      setEditModalOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: "Failed to update media", variant: "destructive" });
    },
  });

  // Delete media item mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete media item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Media deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete media", variant: "destructive" });
    },
  });

  // Quick status update function
  const handleStatusUpdate = (item: MediaItem, newStatus: string) => {
    updateMediaMutation.mutate({
      id: item.id,
      updates: { status: newStatus },
    });
  };

  // Handle edit item
  const handleEditItem = (item: MediaItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cove-blue">My Cove</h1>
              <p className="text-muted-foreground mt-1">Your personal media collection</p>
            </div>
            <Button 
              onClick={() => setAddModalOpen(true)}
              className="bg-cove-blue hover:bg-cove-blue/90 text-slate-900 font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Media</span>
            </Button>
          </div>
        </div>
      </div>

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
                  <div key={item.id} className="group relative">
                    <MediaCard item={item} />
                    
                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
                      {/* Status Selector */}
                      <Select
                        value={item.status}
                        onValueChange={(newStatus) => handleStatusUpdate(item, newStatus)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs bg-background/90">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="watching">Watching</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="planned">Plan to Watch</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditItem(item)}
                          className="h-8 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMediaMutation.mutate(item.id)}
                          className="h-8 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
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

      {/* Edit Media Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedItem.status}
                  onValueChange={(value) => setSelectedItem({ ...selectedItem, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watching">Watching</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="planned">Plan to Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rating">Rating (1-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  value={selectedItem.rating || ""}
                  onChange={(e) => setSelectedItem({ 
                    ...selectedItem, 
                    rating: e.target.value ? parseInt(e.target.value) : null 
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={selectedItem.notes || ""}
                  onChange={(e) => setSelectedItem({ 
                    ...selectedItem, 
                    notes: e.target.value 
                  })}
                  placeholder="Personal notes..."
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => updateMediaMutation.mutate({
                    id: selectedItem.id,
                    updates: {
                      status: selectedItem.status,
                      rating: selectedItem.rating,
                      notes: selectedItem.notes
                    }
                  })}
                  disabled={updateMediaMutation.isPending}
                  className="flex-1"
                >
                  {updateMediaMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
