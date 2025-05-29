import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api";
import { Play, Check, Clock, Star } from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => mediaApi.getStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Watching",
      value: stats.watching,
      icon: Play,
      color: "text-[hsl(var(--warm-amber))]",
    },
    {
      label: "Completed", 
      value: stats.completed,
      icon: Check,
      color: "text-emerald-400",
    },
    {
      label: "Plan to Watch",
      value: stats.planned,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating || 0,
      icon: Star,
      color: "text-[hsl(var(--warm-orange))]",
      format: (val: number) => val.toFixed(1),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.label}
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30 transition-warm hover:border-[hsl(var(--warm-amber))]/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.format ? item.format(item.value) : item.value}
                </p>
              </div>
              <Icon className={`${item.color} text-xl`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
