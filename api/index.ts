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

  const apiKey = process.env.YOUTUBE_API_KEY;

  // TIER 1: Official YouTube API
  if (apiKey) {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=30&key=${apiKey}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const tracks = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          album: "YouTube Music",
          artwork: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          duration: 0,
          genre: "Music",
          isYoutube: true
        }));
        res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        return res.json({ results: tracks, source: "official_api" });
      }
    } catch (apiError) {
      console.error("Official YouTube API failed, moving to Tier 2:", apiError);
    }
  }

  // TIER 2: Piped API
  try {
    const data = await fetchFromPiped(`/search?q=${encodeURIComponent(query)}&filter=videos`);
    const items = (data.items || []).filter((i: any) => i.type === 'video');
    
    if (items.length > 0) {
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
      return res.json({ results: tracks, source: "piped", count: tracks.length });
    }
  } catch (pipedError) {
    console.error("Piped API failed, moving to Tier 3:", pipedError);
  }

  // TIER 3: yt-search (Scraping)
  try {
    const searchResults = await yts(query);
    const videos = searchResults.videos.slice(0, 30);
    
    const tracks = videos.map(video => ({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      album: "YouTube",
      artwork: video.thumbnail,
      url: video.url,
      duration: video.duration.seconds,
      genre: "Music",
      isYoutube: true
    }));

    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.json({ results: tracks, source: "yt-search", count: tracks.length });
  } catch (scrapeError) {
    console.error("All search tiers failed:", scrapeError);
    res.status(500).json({ error: "All search tiers failed", details: String(scrapeError) });
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
  const apiKey = process.env.YOUTUBE_API_KEY;

  // TIER 1: Official API
  if (apiKey) {
    try {
      const trendingUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${apiKey}`;
      const response = await fetch(trendingUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const tracks = data.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          album: "Trending",
          artwork: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          url: `https://www.youtube.com/watch?v=${item.id}`,
          duration: 0,
          genre: "Trending",
          isYoutube: true
        }));
        res.set('Cache-Control', 'public, s-maxage=7200');
        return res.json({ results: tracks, source: "official_api" });
      }
    } catch (e) {
      console.error("Official Trending API failed, moving to Tier 2:", e);
    }
  }

  // TIER 2: Piped API
  try {
    const data = await fetchFromPiped(`/trending?region=US`);
    const videos = data.filter((item: any) => item.type === 'video').slice(0, 30);

    if (videos.length > 0) {
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
      return res.json({ results: tracks, source: "piped" });
    }
  } catch (pipedError) {
    console.error("Piped Trending failed, moving to Tier 3:", pipedError);
  }

  // TIER 3: yt-search
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
    res.json({ results: tracks, source: "yt-search" });
  } catch (scrapeError) {
    console.error("All trending tiers failed:", scrapeError);
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
