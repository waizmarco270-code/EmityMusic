import { Track } from '../types';

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getTrendingTracks(): Promise<Track[]> {
  try {
    const response = await fetch('/api/trending');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Trending error:', error);
    return [];
  }
}
