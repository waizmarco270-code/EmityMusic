import React, { useEffect, useState } from 'react';
import { Library as LibraryIcon, Music, Disc, Mic2 } from 'lucide-react';
import { db } from '../lib/db';
import { Track } from '../types';
import { TrackRow } from '../components/TrackItems';

export function Library() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    db.tracks.toArray().then(setTracks);
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6 p-8 rounded-[40px] bg-gradient-to-br from-indigo-900 to-black overflow-hidden relative">
        <div className="w-48 h-48 rounded-3xl bg-white/10 flex items-center justify-center shadow-2xl relative z-10">
          <LibraryIcon size={80} className="text-white/20" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Collection</p>
          <h1 className="text-7xl font-black tracking-tighter mb-4">Your Library</h1>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1"><Music size={14} /> {tracks.length} Songs</span>
            <span className="flex items-center gap-1"><Disc size={14} /> 0 Albums</span>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-blue-500 blur-[120px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {tracks.length > 0 ? (
          tracks.map((track, i) => <TrackRow key={track.id} track={track} index={i} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
            <Mic2 size={48} className="text-white/10 mb-4" />
            <p className="text-white/30 font-medium">Your library is currently empty</p>
            <button className="mt-4 text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400">Add music</button>
          </div>
        )}
      </div>
    </div>
  );
}
