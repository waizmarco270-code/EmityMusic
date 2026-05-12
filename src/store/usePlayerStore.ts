import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, UserSettings } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  seekTo: number | null;
  
  // Actions
  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      repeat: 'off',
      shuffle: false,
      seekTo: null,

      setTrack: (track) => set({ currentTrack: track, isPlaying: true, progress: 0 }),
      setQueue: (tracks) => set({ queue: tracks }),
      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
      
      playNext: () => {
        const { queue, currentTrack, repeat, shuffle } = get();
        if (!currentTrack || queue.length === 0) return;
        
        let nextIndex;
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
          nextIndex = (currentIndex + 1) % queue.length;
          if (nextIndex === 0 && repeat === 'off') {
             set({ isPlaying: false });
             return;
          }
        }
        set({ currentTrack: queue[nextIndex], progress: 0, isPlaying: true });
      },

      playPrevious: () => {
        const { queue, currentTrack } = get();
        if (!currentTrack || queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        set({ currentTrack: queue[prevIndex], progress: 0, isPlaying: true });
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      toggleRepeat: () => set((state) => {
        const order: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const next = order[(order.indexOf(state.repeat) + 1) % order.length];
        return { repeat: next };
      }),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      seek: (time) => set({ seekTo: time, progress: time }),
    }),
    {
      name: 'lumina-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        repeat: state.repeat, 
        shuffle: state.shuffle,
        // We don't necessarily want to persist the currentTrack if we want a fresh start, 
        // but it's common in music apps.
        currentTrack: state.currentTrack,
        queue: state.queue
      }),
    }
  )
);
