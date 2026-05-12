import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Clock, Compass, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { getTrendingTracks } from '../services/musicService';
import { TrackCard, TrackRow } from '../components/TrackItems';
import { Track } from '../types';
import { db } from '../lib/db';

export function Home() {
  const [trending, setTrending] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [moodSuggestions, setMoodSuggestions] = useState<string[]>(['Lofi', 'Chillhop', 'Phonk', 'Deep House', 'Ambient']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [tr, hist] = await Promise.all([
          getTrendingTracks(),
          db.history.orderBy('playedAt').reverse().limit(10).toArray()
        ]);
        
        setTrending(tr);
        setHistory(hist);
        
        // No AI suggestions needed, use static for stability
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-auto md:h-72 rounded-[24px] md:rounded-[40px] overflow-hidden flex items-center p-6 md:p-12 bg-gradient-to-br from-indigo-600/20 via-transparent to-black/60 shadow-2xl group border border-white/5"
      >
        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay"></div>
        
        <div className="relative z-10 space-y-3 md:space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">
            <Sparkles size={12} className="md:size-[14px]" />
            Featured Stream
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-2 md:mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Nocturnal Pulse
          </h1>
          <p className="text-white/40 text-sm md:text-lg mb-4 md:mb-6 max-w-md leading-relaxed font-medium">
            Synthesized beats for late-night focus, curated by your listening habits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95 text-sm md:text-base">
              Stream Now
            </button>
            <button className="px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 font-bold rounded-full hover:bg-white/10 transition-all active:scale-95 text-xs md:text-sm">
              Save to Library
            </button>
          </div>
        </div>
        
        {/* Geometric Decor */}
        <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000 hidden md:block"></div>
      </motion.section>

      {/* AI Suggestions Row */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Compass className="text-indigo-500" />
            Discover Moods
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {moodSuggestions.map((suggestion, i) => (
            <motion.button 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-6 py-3 rounded-2xl glass hover:bg-white/10 border border-white/5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Trending Tracks Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <TrendingUp className="text-indigo-500" />
            Trending Now
          </h2>
          <button className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">See All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />
             ))
          ) : trending.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Sparkles className="text-indigo-500" />
            Top Mood Mixes
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moodSuggestions.slice(0, 3).map((mood, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Disc className="text-indigo-500" />
                </div>
                <h3 className="text-2xl font-black mb-1 group-hover:text-indigo-500 transition-colors uppercase tracking-tighter">{mood} Mix</h3>
                <p className="text-white/40 text-sm">Finely tuned selection based on {mood} rhythms.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-indigo-500" />
              Recently Played
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((track, i) => (
              <TrackRow key={`${track.id}-${(track as any).playedAt}`} track={track} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
