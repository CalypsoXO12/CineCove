import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

export async function createApp() {
  const app = express();

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body ? 'with body' : 'no body');
    next();
  });

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Response logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Seed database
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Failed to seed database:", error);
  }

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      tmdbConfigured: !!process.env.TMDB_API_KEY
    });
  });

  // Register API routes
  const server = await registerRoutes(app);

  // Static file serving
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    const publicPath = path.join(process.cwd(), "dist");
    console.log("Serving static files from:", publicPath);
    
    app.use(express.static(publicPath));
    
    // SPA fallback
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path === "/health") {
        return res.status(404).json({ message: "Route not found" });
      }
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  return server;
}