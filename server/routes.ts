import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMediaItemSchema, insertAnnouncementSchema, insertUpcomingReleaseSchema, type TMDBSearchResult, type JikanSearchResult } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all media items
  app.get("/api/media", async (req, res) => {
    try {
      const { status, type, search } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchMediaItems(search as string);
      } else if (status) {
        items = await storage.getMediaItemsByStatus(status as string);
      } else if (type) {
        items = await storage.getMediaItemsByType(type as string);
      } else {
        items = await storage.getMediaItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media items" });
    }
  });

  // Get single media item
  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getMediaItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Media item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media item" });
    }
  });

  // Create new media item
  app.post("/api/media", async (req, res) => {
    try {
      const validatedData = insertMediaItemSchema.parse(req.body);
      const item = await storage.createMediaItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create media item" });
    }
  });

  // Update media item
  app.patch("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMediaItemSchema.partial().parse(req.body);
      
      const item = await storage.updateMediaItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Media item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update media item" });
    }
  });

  // Delete media item
  app.delete("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMediaItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Media item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media item" });
    }
  });

  // Search TMDB API for movies/TV shows
  app.get("/api/search/tmdb", async (req, res) => {
    try {
      const { query, type = "movie" } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const apiKey = process.env.TMDB_API_KEY;
      const endpoint = type === "tv" ? "tv" : "movie";
      const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query as string)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results: TMDBSearchResult[] = data.results?.slice(0, 10) || [];
      
      res.json(results);
    } catch (error) {
      console.error("TMDB search error:", error);
      res.status(500).json({ message: "Failed to search TMDB" });
    }
  });

  // Search Jikan API for anime
  app.get("/api/search/jikan", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query as string)}&limit=10`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results: JikanSearchResult[] = data.data || [];
      
      res.json(results);
    } catch (error) {
      console.error("Jikan search error:", error);
      res.status(500).json({ message: "Failed to search Jikan" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const allItems = await storage.getMediaItems();
      
      const stats = {
        total: allItems.length,
        watching: allItems.filter(item => item.status === "watching").length,
        completed: allItems.filter(item => item.status === "completed").length,
        planned: allItems.filter(item => item.status === "planned").length,
        movies: allItems.filter(item => item.type === "movie").length,
        tvShows: allItems.filter(item => item.type === "tv").length,
        anime: allItems.filter(item => item.type === "anime").length,
        avgRating: allItems.length > 0 
          ? parseFloat((allItems
              .filter(item => item.rating !== null)
              .reduce((sum, item) => sum + (item.rating || 0), 0) / 
              allItems.filter(item => item.rating !== null).length || 0)
            .toFixed(1))
          : 0
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ success: true, adminId: admin.id });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Create announcement
  app.post("/api/announcements", async (req, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Delete announcement
  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAnnouncement(id);
      if (!success) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Get upcoming releases
  app.get("/api/upcoming", async (req, res) => {
    try {
      const releases = await storage.getUpcomingReleases();
      res.json(releases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming releases" });
    }
  });

  // Create upcoming release
  app.post("/api/upcoming", async (req, res) => {
    try {
      const validatedData = insertUpcomingReleaseSchema.parse(req.body);
      const release = await storage.createUpcomingRelease(validatedData);
      res.json(release);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create upcoming release" });
    }
  });

  // Delete upcoming release
  app.delete("/api/upcoming/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUpcomingRelease(id);
      if (!success) {
        return res.status(404).json({ message: "Upcoming release not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete upcoming release" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
