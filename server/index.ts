import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { storage } from "./storage";
import { insertMediaItemSchema, insertAnnouncementSchema, insertUpcomingReleaseSchema, insertAdminPickSchema, type TMDBSearchResult, type JikanSearchResult } from "../shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS headers for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    tmdbConfigured: !!process.env.TMDB_API_KEY
  });
});

// API Routes
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
    console.error("Media API error:", error);
    res.status(500).json({ message: "Failed to fetch media items" });
  }
});

app.post("/api/media", async (req, res) => {
  try {
    const validatedData = insertMediaItemSchema.parse(req.body);
    const item = await storage.createMediaItem(validatedData);
    res.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create media item" });
  }
});

app.patch("/api/media/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const item = await storage.updateMediaItem(id, updates);
    
    if (!item) {
      return res.status(404).json({ message: "Media item not found" });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update media item" });
  }
});

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

// Search endpoints
app.get("/api/search/tmdb", async (req, res) => {
  try {
    const { query, type = "movie" } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error("TMDB_API_KEY not found in environment variables");
      return res.json([]);
    }

    const endpoint = type === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query as string)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return res.json([]);
    }
    
    const data = await response.json();
    const results: TMDBSearchResult[] = data.results?.slice(0, 10) || [];
    
    res.json(results);
  } catch (error) {
    console.error("TMDB search error:", error);
    res.json([]);
  }
});

app.get("/api/search/jikan", async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query as string)}&limit=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Jikan API error: ${response.status} ${response.statusText}`);
      return res.json([]);
    }
    
    const data = await response.json();
    const results: JikanSearchResult[] = data.data?.slice(0, 10) || [];
    
    res.json(results);
  } catch (error) {
    console.error("Jikan search error:", error);
    res.json([]);
  }
});

// Announcements
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

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

app.delete("/api/announcements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteAnnouncement(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Announcement not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
});

// Upcoming releases
app.get("/api/upcoming", async (req, res) => {
  try {
    const releases = await storage.getUpcomingReleases();
    res.json(releases);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch upcoming releases" });
  }
});

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

app.delete("/api/upcoming/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteUpcomingRelease(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Upcoming release not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete upcoming release" });
  }
});

// Admin picks
app.get("/api/admin-picks", async (req, res) => {
  try {
    const picks = await storage.getAdminPicks();
    res.json(picks);
  } catch (error) {
    console.error("Admin picks API error:", error);
    res.status(500).json({ message: "Failed to fetch admin picks" });
  }
});

app.post("/api/admin-picks", async (req, res) => {
  try {
    const validatedData = insertAdminPickSchema.parse(req.body);
    const pick = await storage.createAdminPick(validatedData);
    res.json(pick);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create admin pick" });
  }
});

app.delete("/api/admin-picks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteAdminPick(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Admin pick not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete admin pick" });
  }
});

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      isAdmin: user.isAdmin 
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const user = await storage.createUser({ username, password, isAdmin: false });
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      isAdmin: user.isAdmin 
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Serve frontend - both development and production
if (process.env.NODE_ENV === "production") {
  // Production: serve from dist
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/") || req.path === "/health") {
      return res.status(404).json({ message: "Route not found" });
    }
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
} else {
  // Development: proxy to Vite dev server or serve built files if available
  const distPath = path.join(process.cwd(), "dist", "public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path === "/health") {
        return res.status(404).json({ message: "Route not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Fallback for frontend routes in development
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path === "/health") {
        return res.status(404).json({ message: "Route not found" });
      }
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>CineCove - Dev Mode</title></head>
        <body>
        <div id="root"></div>
        <script>
          console.log('Frontend build not found. Run: npm run build first');
          document.getElementById('root').innerHTML = '<h1>Run: npm run build</h1><p>Then refresh this page.</p>';
        </script>
        </body>
        </html>
      `);
    });
  }
}

// Initialize
(async () => {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
  
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`TMDB configured: ${!!process.env.TMDB_API_KEY}`);
  });
})();
