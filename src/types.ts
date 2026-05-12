export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  url: string;
  duration: number; // in seconds
  genre?: string;
  isYoutube?: boolean;
  playedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  artwork?: string;
}

export interface UserSettings {
  theme: 'dark' | 'amoled';
  volume: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
}

export interface SearchResult {
  tracks: Track[];
}
