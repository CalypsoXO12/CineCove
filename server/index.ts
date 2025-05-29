import { createApp } from "./app";
import { log } from "./vite";

(async () => {
  const server = await createApp();
  
  // Use PORT environment variable for Render compatibility
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
