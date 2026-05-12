import React from 'react';
import { Play, MoreVertical, Heart, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn } from '../lib/utils';

interface TrackCardProps {
  track: Track;
  index?: number;
  key?: string | number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index ? index * 0.05 : 0 }}
      className="group relative bg-white/[0.02] border border-white/5 p-4 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl shadow-xl">
        <img 
          src={track.artwork} 
          alt={track.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
            isActive && isPlaying ? "brightness-50" : ""
          )}
        />
        
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <button 
            onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl"
          >
            {isActive && isPlaying ? <motion.div className="flex gap-1 items-end h-4">
              {[0.2, 0.5, 0.3].map((val, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ["4px", "16px", "8px", "16px", "4px"] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 bg-black rounded-full"
                />
              ))}
            </motion.div> : <Play fill="currentColor" size={24} className="ml-1" />}
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 pr-2">
          <h4 className={cn("font-bold truncate text-sm transition-colors", isActive ? "text-indigo-400" : "text-white")}>
            {track.title}
          </h4>
          <p className="text-xs text-white/40 truncate group-hover:text-white/60 transition-colors">
            {track.artist}
          </p>
        </div>
        <button className="text-white/20 hover:text-white transition-colors flex-shrink-0">
          <Heart size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export function TrackRow({ track, index }: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index ? index * 0.03 : 0 }}
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group cursor-pointer border border-transparent",
        isActive ? "bg-white/10 border-white/5" : "hover:bg-white/5"
      )}
      onClick={() => isActive ? togglePlay() : setTrack(track)}
    >
      <div className="w-12 h-12 flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg">
        <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {isActive && isPlaying ? (
            <div className="flex gap-1 items-end h-3">
              {[0.2, 0.5, 0.3].map((val, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ["4px", "12px", "6px", "12px", "4px"] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-0.5 bg-white rounded-full"
                />
              ))}
            </div>
          ) : <Play fill="white" size={16} className="text-white ml-0.5" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold truncate text-sm", isActive ? "text-indigo-400" : "text-white")}>
          {track.title}
        </h4>
        <p className="text-xs text-white/40 truncate">{track.artist}</p>
      </div>

      <div className="text-xs text-white/30 hidden md:block">
        {track.album}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Heart size={16} />
        </button>
        <button className="text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
          <Plus size={16} />
        </button>
        <span className="text-xs font-mono text-white/20">
          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
        </span>
        <button className="text-white/20 hover:text-white transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </motion.div>
  );
}
