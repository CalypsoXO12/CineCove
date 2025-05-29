import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeType: string;
  onTypeChange: (type: string) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  activeType,
  onTypeChange,
  activeStatus,
  onStatusChange,
}: SearchFiltersProps) {
  const typeFilters = [
    { id: "all", label: "All Media" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "anime", label: "Anime" },
  ];

  const statusFilters = [
    { id: "all", label: "All Status" },
    { id: "watching", label: "Watching" },
    { id: "completed", label: "Completed" },
    { id: "planned", label: "Plan to Watch" },
  ];

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search your watchlist..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 bg-card border-border rounded-xl py-3 text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col gap-4">
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeType === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(filter.id)}
              className={
                activeType === filter.id
                  ? "gradient-purple text-white font-medium"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeStatus === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(filter.id)}
              className={
                activeStatus === filter.id
                  ? "gradient-purple text-white font-medium"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
