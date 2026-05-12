import React, { useEffect, useState } from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { db } from '../lib/db';
import { Track } from '../types';
import { TrackRow } from '../components/TrackItems';
import { usePlayerStore } from '../store/usePlayerStore';

export function LikedSongs() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const { setQueue, setTrack } = usePlayerStore();

  useEffect(() => {
    db.favorites.toArray().then(setTracks);
  }, []);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      setTrack(tracks[0]);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-8 p-12 rounded-[40px] bg-gradient-to-br from-rose-900 via-rose-950 to-black relative overflow-hidden">
        <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl relative z-10 flex-shrink-0">
          <Heart size={100} fill="white" className="text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Playlist</p>
          <h1 className="text-8xl font-black tracking-tighter mb-6">Liked Songs</h1>
          <div className="flex items-center gap-6">
            <button 
              onClick={handlePlayAll}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl"
            >
              <Play fill="black" size={20} />
              Play Songs
            </button>
            <button className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all">
              <Shuffle size={20} />
            </button>
            <span className="text-white/40 font-medium ml-2">{tracks.length} tracks</span>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-full bg-rose-500/10 blur-[100px] pointer-events-none" />
      </div>

      <div className="space-y-1">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} index={i} />
        ))}
        {tracks.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-white/20 text-lg">Tracks you like will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
