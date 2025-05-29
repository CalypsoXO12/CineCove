import { mediaItems, type MediaItem, type InsertMediaItem } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";

export interface IStorage {
  getMediaItems(): Promise<MediaItem[]>;
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  createMediaItem(item: InsertMediaItem): Promise<MediaItem>;
  updateMediaItem(id: number, updates: Partial<InsertMediaItem>): Promise<MediaItem | undefined>;
  deleteMediaItem(id: number): Promise<boolean>;
  getMediaItemsByStatus(status: string): Promise<MediaItem[]>;
  getMediaItemsByType(type: string): Promise<MediaItem[]>;
  searchMediaItems(query: string): Promise<MediaItem[]>;
}

export class DatabaseStorage implements IStorage {
  async getMediaItems(): Promise<MediaItem[]> {
    const items = await db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt));
    return items;
  }

  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [item] = await db.select().from(mediaItems).where(eq(mediaItems.id, id));
    return item || undefined;
  }

  async createMediaItem(insertItem: InsertMediaItem): Promise<MediaItem> {
    const [item] = await db
      .insert(mediaItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateMediaItem(id: number, updates: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const [item] = await db
      .update(mediaItems)
      .set(updates)
      .where(eq(mediaItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db.delete(mediaItems).where(eq(mediaItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMediaItemsByStatus(status: string): Promise<MediaItem[]> {
    const items = await db
      .select()
      .from(mediaItems)
      .where(eq(mediaItems.status, status))
      .orderBy(desc(mediaItems.createdAt));
    return items;
  }

  async getMediaItemsByType(type: string): Promise<MediaItem[]> {
    const items = await db
      .select()
      .from(mediaItems)
      .where(eq(mediaItems.type, type))
      .orderBy(desc(mediaItems.createdAt));
    return items;
  }

  async searchMediaItems(query: string): Promise<MediaItem[]> {
    const items = await db
      .select()
      .from(mediaItems)
      .where(
        or(
          like(mediaItems.title, `%${query}%`),
          like(mediaItems.genre, `%${query}%`),
          like(mediaItems.notes, `%${query}%`)
        )
      )
      .orderBy(desc(mediaItems.createdAt));
    return items;
  }
}

export class MemStorage implements IStorage {
  private mediaItems: Map<number, MediaItem>;
  private currentId: number;

  constructor() {
    this.mediaItems = new Map();
    this.currentId = 1;
    
    // Add some initial sample data
    this.seedData();
  }

  private seedData() {
    const sampleItems: Omit<MediaItem, 'id'>[] = [
      {
        title: "Dune",
        type: "movie",
        status: "watching",
        rating: 9,
        notes: "Epic sci-fi masterpiece with stunning visuals",
        posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        tmdbId: 438631,
        jikanId: null,
        genre: "Science Fiction",
        year: 2021,
        createdAt: new Date()
      },
      {
        title: "The Batman",
        type: "movie",
        status: "completed",
        rating: 8,
        notes: "Dark and gritty take on the Dark Knight",
        posterUrl: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        tmdbId: 414906,
        jikanId: null,
        genre: "Action",
        year: 2022,
        createdAt: new Date()
      },
      {
        title: "Breaking Bad",
        type: "tv",
        status: "completed",
        rating: 10,
        notes: "Greatest TV series of all time",
        posterUrl: "https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
        tmdbId: 1396,
        jikanId: null,
        genre: "Crime",
        year: 2008,
        createdAt: new Date()
      },
      {
        title: "The Last of Us",
        type: "tv",
        status: "watching",
        rating: 9,
        notes: "Outstanding adaptation of the beloved game",
        posterUrl: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
        tmdbId: 100088,
        jikanId: null,
        genre: "Drama",
        year: 2023,
        createdAt: new Date()
      },
      {
        title: "Attack on Titan",
        type: "anime",
        status: "completed",
        rating: 10,
        notes: "Mind-blowing finale, incredible storytelling",
        posterUrl: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        tmdbId: null,
        jikanId: 16498,
        genre: "Action",
        year: 2013,
        createdAt: new Date()
      },
      {
        title: "Your Name",
        type: "anime",
        status: "planned",
        rating: null,
        notes: "Heard amazing things about this one",
        posterUrl: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
        tmdbId: null,
        jikanId: 32281,
        genre: "Romance",
        year: 2016,
        createdAt: new Date()
      }
    ];

    sampleItems.forEach(item => {
      const id = this.currentId++;
      this.mediaItems.set(id, { ...item, id });
    });
  }

  async getMediaItems(): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    return this.mediaItems.get(id);
  }

  async createMediaItem(insertItem: InsertMediaItem): Promise<MediaItem> {
    const id = this.currentId++;
    const item: MediaItem = { 
      ...insertItem,
      rating: insertItem.rating ?? null,
      notes: insertItem.notes ?? null,
      posterUrl: insertItem.posterUrl ?? null,
      tmdbId: insertItem.tmdbId ?? null,
      jikanId: insertItem.jikanId ?? null,
      genre: insertItem.genre ?? null,
      year: insertItem.year ?? null,
      id, 
      createdAt: new Date() 
    };
    this.mediaItems.set(id, item);
    return item;
  }

  async updateMediaItem(id: number, updates: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const existing = this.mediaItems.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.mediaItems.set(id, updated);
    return updated;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    return this.mediaItems.delete(id);
  }

  async getMediaItemsByStatus(status: string): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values())
      .filter(item => item.status === status)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMediaItemsByType(type: string): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values())
      .filter(item => item.type === type)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async searchMediaItems(query: string): Promise<MediaItem[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.mediaItems.values())
      .filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.genre?.toLowerCase().includes(lowercaseQuery) ||
        item.notes?.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
}

export const storage = new DatabaseStorage();
