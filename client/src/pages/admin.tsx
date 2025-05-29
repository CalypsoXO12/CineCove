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
import { CineNestLogo } from "@/components/CineNestLogo";
import type { Announcement, UpcomingRelease, MediaItem } from "@shared/schema";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [upcomingForm, setUpcomingForm] = useState({
    title: "",
    type: "",
    releaseDate: "",
    posterUrl: "",
    description: "",
    isHighlighted: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) throw new Error("Invalid credentials");
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoggedIn(true);
      setAdminId(data.adminId);
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    }
  });

  // Fetch data
  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: () => fetch("/api/announcements").then(res => res.json()),
    enabled: isLoggedIn
  });

  const { data: upcomingReleases = [] } = useQuery({
    queryKey: ["/api/upcoming"],
    queryFn: () => fetch("/api/upcoming").then(res => res.json()),
    enabled: isLoggedIn
  });

  const { data: mediaItems = [] } = useQuery({
    queryKey: ["/api/media"],
    queryFn: () => fetch("/api/media").then(res => res.json()),
    enabled: isLoggedIn
  });

  // Create announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; adminId: number }) => {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setAnnouncementForm({ title: "", content: "" });
      toast({ title: "Announcement created successfully" });
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
        body: JSON.stringify({ ...data, adminId })
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;
    createAnnouncementMutation.mutate({ ...announcementForm, adminId });
  };

  const handleCreateUpcoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;
    createUpcomingMutation.mutate(upcomingForm);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CineNestLogo />
            </div>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-purple text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <CineNestLogo />
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
            <Button 
              onClick={() => setIsLoggedIn(false)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

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
              <Dialog>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map((item: MediaItem) => (
                <Card key={item.id}>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}