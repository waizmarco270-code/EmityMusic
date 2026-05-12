import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import yts from "yt-search";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    try {
      // YouTube Search
      const searchResults = await yts(query);
      const videos = searchResults.videos.slice(0, 20);

      const tracks = videos.map(video => ({
        id: video.videoId,
        title: video.title,
        artist: video.author.name,
        album: "YouTube",
        artwork: video.thumbnail,
        url: video.url, // This is the YouTube link, we'll need a stream URL for the player
        duration: video.duration.seconds,
        genre: "Unknown",
        isYoutube: true
      }));

      res.json({ results: tracks });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get stream URL proxy-like endpoint
  app.get("/api/stream", async (req, res) => {
    const videoId = req.query.id as string;
    if (!videoId) return res.status(400).json({ error: "ID required" });

    try {
      // Use more stable Piped instances
      const instances = [
        "https://pipedapi.kavin.rocks",
        "https://api-piped.mha.fi",
        "https://pipedapi.colum.solutions"
      ];

      let streamUrl = null;
      let mimeType = null;

      for (const instance of instances) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout per instance

          const response = await fetch(`${instance}/streams/${videoId}`, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) continue;
          const data = await response.json();
          
          // Prefer high quality audio streams
          // Usually mimeType is like "audio/webm; codecs=\"opus\""
          const audioStream = data.audioStreams?.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
            .find((s: any) => s.mimeType.includes('audio/webm') || s.mimeType.includes('audio/mp4') || s.mimeType.includes('audio/mpeg'));

          if (audioStream) {
            streamUrl = audioStream.url;
            mimeType = audioStream.mimeType;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (streamUrl) {
        res.json({ url: streamUrl, mimeType });
      } else {
        // Fallback: This is a hacky way to get a direct stream if Piped is failing
        // But for "free and unlimited", Piped is the best bet.
        res.status(404).json({ error: "Stream not found" });
      }
    } catch (error) {
      console.error("Stream error:", error);
      res.status(500).json({ error: "Failed to get stream" });
    }
  });

  // Trending proxy
  app.get("/api/trending", async (req, res) => {
    try {
      const searchResults = await yts("trending music 2025");
      const tracks = searchResults.videos.slice(0, 20).map(video => ({
        id: video.videoId,
        title: video.title,
        artist: video.author.name,
        album: "Trending",
        artwork: video.thumbnail,
        url: video.url,
        duration: video.duration.seconds,
        genre: "Trending",
        isYoutube: true
      }));
      res.json({ results: tracks });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
