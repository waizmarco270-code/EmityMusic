import React, { useEffect, useState } from 'react';
import { Compass, Music, Flame, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getTrendingTracks } from '../services/musicService';
import { TrackCard } from '../components/TrackItems';
import { Track } from '../types';

export function Explore() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Chill'];

  useEffect(() => {
    getTrendingTracks().then(setTracks);
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
          <Compass size={48} className="text-indigo-500" />
          Explore Universe
        </h1>
        
        <div className="flex gap-2 p-1 bg-white/[0.03] rounded-2xl border border-white/5 w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-morphism rounded-[32px] p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Flame size={20} className="text-rose-500" />
              Hot Right Now
            </h3>
            <div className="space-y-4">
               {tracks.slice(0, 5).map((track, i) => (
                 <div key={track.id} className="flex items-center gap-4 group cursor-pointer">
                    <span className="text-2xl font-black text-white/10 group-hover:text-indigo-500 transition-colors w-8">{i + 1}</span>
                    <img src={track.artwork} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{track.title}</p>
                      <p className="text-xs text-white/40 truncate">{track.artist}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[32px] p-8 relative overflow-hidden">
             <div className="relative z-10">
               <Sparkles className="text-white/40 mb-4" />
               <h3 className="text-2xl font-black mb-2">Upgrade to Pro</h3>
               <p className="text-white/60 text-sm mb-6">Unlock high-fidelity audio and exclusive Emity themes.</p>
               <button className="w-full py-3 rounded-2xl bg-white text-indigo-900 font-bold hover:scale-105 transition-transform active:scale-95">
                 Learn More
               </button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
