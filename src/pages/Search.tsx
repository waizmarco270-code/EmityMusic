import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, Layers } from 'lucide-react';
import { searchTracks } from '../services/musicService';
import { TrackRow } from '../components/TrackItems';
import { Track } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (val: string) => {
    setIsSearching(true);
    const tracks = await searchTracks(val);
    setResults(tracks);
    setIsSearching(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Search Results for</p>
          <h1 className="text-6xl font-black tracking-tighter leading-[0.8] mb-2 uppercase">"{query}"</h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
          <Filter size={16} />
          Filters
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-1 p-6 rounded-[48px] bg-[#111111] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative z-10"
          >
            {results.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} />
            ))}
          </motion.div>
        ) : query ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass-morphism rounded-[40px] m-4"
          >
            <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <SearchIcon size={40} className="text-indigo-500/40" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">No signals found</h3>
              <p className="text-white/40 text-sm leading-relaxed">The universe is silent on this query. Try recalibrating your keywords.</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-48 text-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-[40px]">
             <Layers size={64} className="text-white/5 mb-8" />
             <div className="space-y-2">
               <p className="text-white/40 text-xl font-black uppercase tracking-tighter">Gateway to Sound</p>
               <p className="text-white/20 text-sm">Initiate sequence by typing your query above.</p>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
