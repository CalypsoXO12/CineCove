import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Calendar, Clock, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CineCoveLogo } from "@/components/CineNestLogo";
import type { Announcement, UpcomingRelease, MediaItem } from "@shared/schema";

interface AdminPanelProps {
  user: { id: number; isAdmin: boolean } | null;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [upcomingDialogOpen, setUpcomingDialogOpen] = useState(false);
  const [upcomingForm, setUpcomingForm] = useState({
    title: "",
    type: "",
    releaseDate: "",
    posterUrl: "",
    description: "",
    isHighlighted: false
  });

  const [adminPickDialogOpen, setAdminPickDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has admin access
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CineCoveLogo />
            </div>
            <CardTitle className="text-amber-400">Captain's Quarters</CardTitle>
            <p className="text-muted-foreground mt-2">
              This area is restricted to authorized personnel only.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in with captain credentials to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch data
  const { data: announcements = [], error: announcementsError } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return res.json();
    }
  });

  const { data: upcomingReleases = [], error: upcomingError } = useQuery({
    queryKey: ["/api/upcoming"],
    queryFn: async () => {
      const res = await fetch("/api/upcoming");
      if (!res.ok) throw new Error("Failed to fetch upcoming releases");
      return res.json();
    }
  });

  const { data: mediaItems = [], error: mediaError } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error("Failed to fetch media items");
      return res.json();
    }
  });

  // Fetch admin picks
  const { data: adminPicks = [], error: adminPicksError } = useQuery({
    queryKey: ["/api/admin-picks"],
    queryFn: async () => {
      const res = await fetch("/api/admin-picks");
      if (!res.ok) throw new Error("Failed to fetch admin picks");
      return res.json();
    }
  });

  // Create announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; adminId: number }) => {
      console.log("Creating announcement with data:", data);
      
      const payload = {
        title: data.title,
        content: data.content,
        adminId: data.adminId
      };
      
      console.log("Sending payload:", payload);
      
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Announcement creation failed:", response.status, errorText);
        throw new Error(`Failed to create announcement: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Announcement created successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setAnnouncementForm({ title: "", content: "" });
      setAnnouncementDialogOpen(false);
      toast({ title: "Announcement created successfully" });
    },
    onError: (error) => {
      console.error("Announcement mutation error:", error);
      toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
    }
  });

  // Delete announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete announcement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement deleted successfully" });
    }
  });

  // Create upcoming release
  const createUpcomingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/upcoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user.id })
      });
      if (!response.ok) throw new Error("Failed to create upcoming release");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upcoming"] });
      setUpcomingForm({
        title: "",
        type: "",
        releaseDate: "",
        posterUrl: "",
        description: "",
        isHighlighted: false
      });
      toast({ title: "Upcoming release created successfully" });
    }
  });

  // Delete upcoming release
  const deleteUpcomingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/upcoming/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete upcoming release");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upcoming"] });
      toast({ title: "Upcoming release deleted successfully" });
    }
  });

  // Create admin pick
  const createAdminPickMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      const mediaItem = mediaItems.find((item: any) => item.id === mediaId);
      if (!mediaItem) throw new Error("Media item not found");

      const adminPickData = {
        title: mediaItem.title,
        type: mediaItem.type,
        posterUrl: mediaItem.posterUrl,
        tmdbId: mediaItem.tmdbId,
        jikanId: mediaItem.jikanId,
        genre: mediaItem.genre,
        year: mediaItem.year,
        isFeatured: true
      };

      const response = await fetch("/api/admin-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminPickData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create admin pick: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-picks"] });
      setAdminPickDialogOpen(false);
      toast({ title: "Admin pick created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create admin pick", description: error.message, variant: "destructive" });
    }
  });

  // Delete admin pick
  const deleteAdminPickMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin-picks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete admin pick");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin-picks"] });
      toast({ title: "Admin pick deleted successfully" });
    }
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncementMutation.mutate({ ...announcementForm, adminId: user.id });
  };

  const handleCreateUpcoming = (e: React.FormEvent) => {
    e.preventDefault();
    createUpcomingMutation.mutate(upcomingForm);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-amber-400">Captain's Quarters</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Welcome, Captain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="upcoming">Coming Soon</TabsTrigger>
            <TabsTrigger value="picks">Admin Picks</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Calendar className="h-6 w-6" />
                <span>Manage Announcements</span>
              </h2>
              <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-purple text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-purple text-white">
                      Create Announcement
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {announcements.map((announcement: Announcement) => (
                <Card key={announcement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{announcement.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{announcement.content}</p>
                        <span className="text-xs text-purple-400">
                          {new Date(announcement.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upcoming Releases Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span>Manage Coming Soon</span>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-purple text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Release
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Upcoming Release</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUpcoming} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={upcomingForm.title}
                          onChange={(e) => setUpcomingForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={upcomingForm.type}
                          onValueChange={(value) => setUpcomingForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="movie">Movie</SelectItem>
                            <SelectItem value="tv">TV Show</SelectItem>
                            <SelectItem value="anime">Anime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="releaseDate">Release Date</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={upcomingForm.releaseDate}
                          onChange={(e) => setUpcomingForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="posterUrl">Poster URL</Label>
                        <Input
                          id="posterUrl"
                          value={upcomingForm.posterUrl}
                          onChange={(e) => setUpcomingForm(prev => ({ ...prev, posterUrl: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={upcomingForm.description}
                        onChange={(e) => setUpcomingForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="highlighted"
                        checked={upcomingForm.isHighlighted}
                        onChange={(e) => setUpcomingForm(prev => ({ ...prev, isHighlighted: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="highlighted">Featured Release</Label>
                    </div>
                    <Button type="submit" className="w-full gradient-purple text-white">
                      Add Release
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingReleases.map((release: UpcomingRelease) => (
                <Card key={release.id}>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img 
                        src={release.posterUrl || "/placeholder-poster.jpg"} 
                        alt={release.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{release.title}</h3>
                            <p className="text-muted-foreground text-xs capitalize">{release.type}</p>
                            <p className="text-muted-foreground text-xs">
                              {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : 'TBA'}
                            </p>
                            {release.isHighlighted && (
                              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded mt-1 inline-block">
                                Featured
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => deleteUpcomingMutation.mutate(release.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Admin Picks Tab */}
          <TabsContent value="picks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <Star className="h-6 w-6" />
                <span>Manage Admin Picks</span>
              </h2>
              <Dialog open={adminPickDialogOpen} onOpenChange={setAdminPickDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin Pick
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Select Media for Admin Pick</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {mediaItems.map((item: MediaItem) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => createAdminPickMutation.mutate(item.id)}>
                          <CardContent className="p-4">
                            <div className="flex space-x-4">
                              <img 
                                src={item.posterUrl || "/placeholder-poster.jpg"} 
                                alt={item.title}
                                className="w-16 h-24 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                                <p className="text-muted-foreground text-xs capitalize">{item.type}</p>
                                <p className="text-muted-foreground text-xs capitalize">{item.status}</p>
                                {item.rating && (
                                  <p className="text-purple-400 text-xs">★ {item.rating}/10</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminPicks.map((pick: any) => (
                <Card key={pick.id}>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img 
                        src={pick.posterUrl || "/placeholder-poster.jpg"} 
                        alt={pick.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{pick.title}</h3>
                        <p className="text-muted-foreground text-xs capitalize">{pick.type}</p>
                        {pick.year && (
                          <p className="text-muted-foreground text-xs">{pick.year}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                          <Button
                            onClick={() => deleteAdminPickMutation.mutate(pick.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}