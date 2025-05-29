import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Star, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { mediaApi } from "@/lib/api";
import { insertMediaItemSchema, type InsertMediaItem, type TMDBSearchResult, type JikanSearchResult } from "@shared/schema";

interface AddMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMediaModal({ open, onOpenChange }: AddMediaModalProps) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<(TMDBSearchResult | JikanSearchResult)[]>([]);
  const [selectedType, setSelectedType] = useState<"movie" | "tv" | "anime">("movie");

  const form = useForm<InsertMediaItem>({
    resolver: zodResolver(insertMediaItemSchema),
    defaultValues: {
      title: "",
      type: "movie",
      status: "planned",
      rating: null,
      notes: "",
      posterUrl: "",
      tmdbId: null,
      jikanId: null,
      genre: "",
      year: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: mediaApi.createMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Media item added to your watchlist",
      });
      onOpenChange(false);
      form.reset();
      setSearchResults([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add media item",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let results: (TMDBSearchResult | JikanSearchResult)[] = [];
      
      if (selectedType === "anime") {
        results = await mediaApi.searchJikan(query);
      } else {
        results = await mediaApi.searchTMDB(query, selectedType);
      }
      
      setSearchResults(results.slice(0, 5));
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for media",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: TMDBSearchResult | JikanSearchResult) => {
    if ("mal_id" in result) {
      // Jikan result
      form.setValue("title", result.title);
      form.setValue("type", "anime");
      form.setValue("posterUrl", result.images.jpg.image_url);
      form.setValue("jikanId", result.mal_id);
      form.setValue("year", result.year || null);
      form.setValue("genre", result.genres?.map(g => g.name).join(", ") || "");
    } else {
      // TMDB result
      const title = result.title || result.name || "";
      const releaseYear = result.release_date 
        ? new Date(result.release_date).getFullYear()
        : result.first_air_date 
        ? new Date(result.first_air_date).getFullYear()
        : null;
      
      form.setValue("title", title);
      form.setValue("type", selectedType);
      form.setValue("posterUrl", result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : "");
      form.setValue("tmdbId", result.id);
      form.setValue("year", releaseYear);
    }
    
    setSearchResults([]);
  };

  const onSubmit = (data: InsertMediaItem) => {
    createMutation.mutate(data);
  };

  const handleTypeChange = (type: "movie" | "tv" | "anime") => {
    setSelectedType(type);
    form.setValue("type", type);
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Media</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Search Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search & Add</label>
              
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                {["movie", "tv", "anime"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeChange(type as "movie" | "tv" | "anime")}
                    className={
                      selectedType === type
                        ? "gradient-purple text-white font-medium"
                        : "bg-card border-border text-muted-foreground"
                    }
                  >
                    {type === "tv" ? "TV Show" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search for ${selectedType === "tv" ? "TV shows" : selectedType}...`}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  disabled={isSearching}
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => {
                    const title = "title" in result ? result.title : "name" in result ? result.name : result.title;
                    const year = "year" in result ? result.year 
                      : "release_date" in result ? result.release_date?.substring(0, 4)
                      : "first_air_date" in result ? result.first_air_date?.substring(0, 4)
                      : "";
                    const poster = "images" in result 
                      ? result.images.jpg.image_url
                      : result.poster_path 
                      ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
                      : "";

                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => selectSearchResult(result)}
                      >
                        {poster && (
                          <img src={poster} alt={title} className="w-12 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{title}</p>
                          {year && <p className="text-muted-foreground text-xs">{year}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual Entry Fields */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter title manually..."
                      {...field}
                      className="bg-secondary border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="planned">Plan to Watch</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Rating (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      placeholder="8.5"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your thoughts..."
                      rows={3}
                      {...field}
                      className="bg-secondary border-border text-foreground resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-secondary border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 gradient-warm text-[hsl(var(--dark-primary))] font-medium hover:shadow-lg"
              >
                {createMutation.isPending ? "Adding..." : "Add Media"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
