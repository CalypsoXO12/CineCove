import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'movie', 'tv', 'anime'
  status: text("status").notNull(), // 'watching', 'completed', 'planned'
  rating: integer("rating"), // 1-10 scale
  notes: text("notes"),
  posterUrl: text("poster_url"),
  tmdbId: integer("tmdb_id"),
  jikanId: integer("jikan_id"),
  genre: text("genre"),
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItems.$inferSelect;

// API response types
export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
}

export interface JikanSearchResult {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  year?: number;
  synopsis?: string;
  genres?: Array<{ name: string }>;
}
