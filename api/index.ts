import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

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

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api-piped.mha.fi",
  "https://pipedapi.colum.solutions",
  "https://piped-api.lunar.icu",
  "https://yt.artemislena.eu",
  "https://piped-api.garudalinux.org"
];

async function fetchFromPiped(endpoint: string) {
  let lastError = null;
  for (const instance of PIPED_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(`${instance}${endpoint}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError || new Error("All Piped instances failed");
}

app.get(["/api/search", "/search"], async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const data = await fetchFromPiped(`/search?q=${encodeURIComponent(query)}&filter=videos`);
    
    const items = (data.items || []).filter((i: any) => i.type === 'video');
    
    const tracks = items.map((video: any) => {
      const videoId = video.url.includes("v=") ? video.url.split("v=")[1] : video.url.split("/").pop();
      return {
        id: videoId,
        title: video.title,
        artist: video.uploaderName,
        album: "YouTube Music",
        artwork: video.thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: video.duration || 0,
        genre: "Music",
        isYoutube: true
      };
    });

    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.json({ results: tracks, source: "piped", count: tracks.length });
  } catch (error) {
    console.error("Piped search failed:", error);
    res.status(500).json({ error: "Search failed", details: String(error) });
  }
});

app.get(["/api/stream", "/stream"], async (req, res) => {
  const videoId = req.query.id as string;
  if (!videoId) return res.status(400).json({ error: "ID required" });

  try {
    let streamUrl = null;
    let errorDetails = [];

    for (const instance of PIPED_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${instance}/streams/${videoId}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          errorDetails.push(`${instance}: ${response.status}`);
          continue;
        }
        const data = await response.json();
        const audioStream = data.audioStreams?.find((s: any) => s.mimeType.includes('audio'));
        if (audioStream) {
          streamUrl = audioStream.url;
          break;
        }
      } catch (e: any) { 
        errorDetails.push(`${instance}: ${e.message}`);
        continue; 
      }
    }

    if (streamUrl) {
      res.set('Cache-Control', 'public, s-maxage=3600');
      res.json({ url: streamUrl });
    } else {
      res.status(404).json({ error: "Stream unavailable", details: errorDetails });
    }
  } catch (error) {
    res.status(500).json({ error: "Stream error" });
  }
});

app.get(["/api/trending", "/trending"], async (req, res) => {
  try {
    const data = await fetchFromPiped(`/trending?region=US`);
    
    const videos = data.filter((item: any) => item.type === 'video').slice(0, 30);

    const tracks = videos.map((video: any) => {
      const videoId = video.url.includes("v=") ? video.url.split("v=")[1] : video.url.split("/").pop();
      return {
        id: videoId,
        title: video.title,
        artist: video.uploaderName,
        album: "Trending",
        artwork: video.thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: video.duration || 0,
        genre: "Trending",
        isYoutube: true
      };
    });

    res.set('Cache-Control', 'public, s-maxage=7200');
    res.json({ results: tracks, source: "piped" });
  } catch (error) {
    console.error("Piped trending failed:", error);
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
