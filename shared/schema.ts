import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  adminId: integer("admin_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Upcoming releases table
export const upcomingReleases = pgTable("upcoming_releases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'movie', 'tv', 'anime'
  releaseDate: text("release_date"), // YYYY-MM-DD format
  posterUrl: text("poster_url"),
  tmdbId: integer("tmdb_id"),
  jikanId: integer("jikan_id"),
  description: text("description"),
  isHighlighted: boolean("is_highlighted").default(false),
  adminId: integer("admin_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUpcomingReleaseSchema = createInsertSchema(upcomingReleases).omit({
  id: true,
  createdAt: true,
});

export type InsertUpcomingRelease = z.infer<typeof insertUpcomingReleaseSchema>;
export type UpcomingRelease = typeof upcomingReleases.$inferSelect;

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
