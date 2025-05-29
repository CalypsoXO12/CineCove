import { Star } from "lucide-react";
import type { MediaItem } from "@shared/schema";

interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
}

export function MediaCard({ item, onClick }: MediaCardProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "watching":
        return "status-watching";
      case "completed":
        return "status-completed";
      case "planned":
        return "status-planned";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "watching":
        return "Watching";
      case "completed":
        return "Completed";
      case "planned":
        return "Plan to Watch";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Movie";
      case "tv":
        return "TV Show";
      case "anime":
        return "Anime";
      default:
        return type;
    }
  };

  return (
    <div 
      className="group cursor-pointer media-card"
      onClick={onClick}
    >
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-[hsl(var(--warm-amber))]/50 transition-all duration-300">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={item.posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"}
            alt={`${item.title} poster`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`${getStatusBadgeClass(item.status)} px-2 py-1 rounded-lg text-xs font-medium`}>
              {getStatusLabel(item.status)}
            </span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[hsl(var(--dark-primary))] via-[hsl(var(--dark-primary))]/80 to-transparent p-4">
            <h3 className="font-semibold text-foreground mb-1 text-sm leading-tight line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.rating ? (
                  <>
                    <Star className="text-[hsl(var(--warm-amber))] h-3 w-3 fill-current" />
                    <span className="text-sm font-medium text-[hsl(var(--warm-amber))]">
                      {item.rating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <>
                    <Star className="text-muted-foreground h-3 w-3" />
                    <span className="text-sm font-medium text-muted-foreground">--</span>
                  </>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {getTypeLabel(item.type)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
