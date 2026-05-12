import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import yts from "yt-search";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", vercel: !!process.env.VERCEL, timestamp: new Date().toISOString() });
});

app.get(["/api/search", "/search"], async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const searchResults = await yts(query);
    const videos = searchResults.videos.length > 0 ? searchResults.videos : (searchResults.all?.filter((i: any) => i.type === 'video') || []);
    
    const tracks = videos.slice(0, 30).map((video: any) => ({
      id: video.videoId,
      title: video.title,
      artist: video.author?.name || "Unknown Artist",
      album: "YouTube Music",
      artwork: video.thumbnail || video.image,
      url: video.url,
      duration: video.duration?.seconds || 0,
      genre: "Music",
      isYoutube: true
    }));

    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.json({ results: tracks, count: tracks.length });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search execution failed", details: String(error) });
  }
});

app.get(["/api/stream", "/stream"], async (req, res) => {
  const videoId = req.query.id as string;
  if (!videoId) return res.status(400).json({ error: "ID required" });

  try {
    const instances = [
      "https://pipedapi.kavin.rocks",
      "https://api-piped.mha.fi",
      "https://pipedapi.colum.solutions"
    ];

    let streamUrl = null;
    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/streams/${videoId}`);
        if (!response.ok) continue;
        const data = await response.json();
        const audioStream = data.audioStreams?.find((s: any) => s.mimeType.includes('audio'));
        if (audioStream) {
          streamUrl = audioStream.url;
          break;
        }
      } catch (e) { continue; }
    }

    if (streamUrl) {
      res.set('Cache-Control', 'public, s-maxage=3600');
      res.json({ url: streamUrl });
    } else {
      res.status(404).json({ error: "Stream unavailable" });
    }
  } catch (error) {
    res.status(500).json({ error: "Stream error" });
  }
});

app.get(["/api/trending", "/trending"], async (req, res) => {
  try {
    const searchResults = await yts("trending hits 2025");
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
    res.set('Cache-Control', 'public, s-maxage=7200');
    res.json({ results: tracks });
  } catch (error) {
    res.status(500).json({ error: "Trending failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Only serve static files via Express if NOT on Vercel
    // Vercel handles static routing via vercel.json rewrites naturally
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
