import { mediaItems, type MediaItem, type InsertMediaItem } from "@shared/schema";

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
        notes: "Incredible visuals and world-building",
        posterUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        tmdbId: 438631,
        jikanId: null,
        genre: "Sci-Fi",
        year: 2021,
        createdAt: new Date()
      },
      {
        title: "Attack on Titan",
        type: "anime",
        status: "completed",
        rating: 10,
        notes: "Mind-blowing finale season",
        posterUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        tmdbId: null,
        jikanId: 16498,
        genre: "Action",
        year: 2013,
        createdAt: new Date()
      },
      {
        title: "Breaking Bad",
        type: "tv",
        status: "completed",
        rating: 10,
        notes: "Perfect character development",
        posterUrl: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        tmdbId: 1396,
        jikanId: null,
        genre: "Drama",
        year: 2008,
        createdAt: new Date()
      },
      {
        title: "Spirited Away",
        type: "anime",
        status: "planned",
        rating: null,
        notes: "",
        posterUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        tmdbId: null,
        jikanId: 199,
        genre: "Fantasy",
        year: 2001,
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

export const storage = new MemStorage();
