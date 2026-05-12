import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, 
  Volume2, VolumeX, Maximize2, Minimize2, ListMusic, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn, formatDuration } from '../lib/utils';
import { db } from '../lib/db';

export function Player() {
  const { 
    currentTrack, isPlaying, volume, progress, duration, 
    repeat, shuffle, togglePlay, setVolume, toggleRepeat, 
    toggleShuffle, playNext, playPrevious 
  } = usePlayerStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      db.favorites.get(currentTrack.id).then(track => setIsLiked(!!track));
    }
  }, [currentTrack]);

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    if (isLiked) {
      await db.favorites.delete(currentTrack.id);
    } else {
      await db.favorites.add(currentTrack);
    }
    setIsLiked(!isLiked);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    usePlayerStore.getState().seek(percent * duration);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
          isFullscreen ? "bottom-0 left-0 translate-x-0 w-full h-full" : "w-[95%] max-w-5xl"
        )}
      >
        <div className={cn(
          "glass-morphism rounded-3xl p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden",
          isFullscreen && "rounded-none h-full justify-center items-center p-6 md:p-20 bg-black"
        )}>
           {/* Fullscreen Background Artwork */}
           <AnimatePresence>
             {isFullscreen && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.5 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-0"
               >
                 <img 
                   src={currentTrack.artwork} 
                   alt="" 
                   className="w-full h-full object-cover blur-[100px] scale-150"
                 />
                 <div className="absolute inset-0 bg-black/60" />
               </motion.div>
             )}
           </AnimatePresence>

           {/* Progress Bar */}
           {!isFullscreen && (
             <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
             </div>
           )}

           <div className={cn(
             "flex items-center gap-6 relative z-10 w-full", 
             isFullscreen ? "flex-col max-w-4xl mx-auto" : ""
           )}>
              {/* Cover Art */}
              <div className="relative group shrink-0">
                <motion.img 
                  layoutId="player-artwork"
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className={cn(
                    "w-14 h-14 rounded-xl object-cover shadow-lg",
                    isFullscreen ? "w-64 h-64 md:w-96 md:h-96 rounded-3xl mb-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]" : "w-14 h-14"
                  )}
                />
                {!isFullscreen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full"></div>
                )}
              </div>

              {/* Info */}
              <div className={cn("flex-1 min-w-0", isFullscreen && "text-center mb-10 w-full")}>
                <h3 className={cn(
                  "font-bold truncate text-white tracking-tight", 
                  isFullscreen ? "text-3xl md:text-5xl mb-4" : "text-base"
                )}>
                  {currentTrack.title}
                </h3>
                <p className={cn(
                  "text-white/50 truncate font-medium", 
                  isFullscreen ? "text-lg md:text-2xl" : "text-xs"
                )}>
                  {currentTrack.artist}
                </p>
              </div>

              {/* Controls */}
              <div className={cn(
                "flex flex-col items-center gap-2", 
                isFullscreen ? "w-full" : "flex-1"
              )}>
                <div className={cn("flex items-center", isFullscreen ? "gap-12 md:gap-16" : "gap-8")}>
                  <button 
                    onClick={toggleShuffle}
                    className={cn(
                      "transition-colors opacity-40 hover:opacity-100", 
                      shuffle && "text-indigo-400 opacity-100"
                    )}
                  >
                    <Shuffle size={isFullscreen ? 28 : 18} />
                  </button>
                  <button onClick={playPrevious} className="hover:scale-110 transition-transform text-white/70 hover:text-white">
                    <SkipBack size={isFullscreen ? 36 : 22} fill="currentColor" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className={cn(
                      "rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-white/10",
                      isFullscreen ? "w-20 h-20" : "w-12 h-12"
                    )}
                  >
                    {isPlaying ? (
                      <Pause size={isFullscreen ? 36 : 24} fill="currentColor" />
                    ) : (
                      <Play size={isFullscreen ? 36 : 24} fill="currentColor" className={isFullscreen ? "ml-1.5" : "ml-1"} />
                    )}
                  </button>
                  <button onClick={playNext} className="hover:scale-110 transition-transform text-white/70 hover:text-white">
                    <SkipForward size={isFullscreen ? 36 : 22} fill="currentColor" />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className={cn(
                      "transition-colors relative opacity-40 hover:opacity-100", 
                      repeat !== 'off' && "text-indigo-400 opacity-100"
                    )}
                  >
                    <Repeat size={isFullscreen ? 28 : 18} />
                    {repeat === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold uppercase">1</span>}
                  </button>
                </div>

                {!isFullscreen ? (
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/40">{formatDuration(progress)}</span>
                    <div 
                      onClick={handleSeek}
                      className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden cursor-pointer group"
                    >
                      <motion.div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full group-hover:from-indigo-400 group-hover:to-rose-400"
                        style={{ width: `${(progress / duration) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">{formatDuration(duration)}</span>
                  </div>
                ) : (
                  <div className="w-full mt-10 md:mt-16 flex flex-col gap-4">
                    <div 
                      onClick={handleSeek}
                      className="h-2 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
                    >
                       <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"
                        style={{ width: `${(progress / duration) * 100}%` }}
                       />
                       <div 
                         className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                         style={{ left: `calc(${(progress / duration) * 100}% - 8px)` }}
                       />
                    </div>
                    <div className="flex justify-between text-xs md:text-sm text-white/40 font-mono tracking-normal">
                      <span>{formatDuration(progress)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Volume */}
              <div className={cn(
                "flex items-center gap-6", 
                isFullscreen ? "mt-12 md:mt-20 w-full justify-center" : "justify-end sm:min-w-[180px]"
              )}>
                <button onClick={handleToggleLike} className={cn("transition-colors", isLiked ? "text-indigo-400" : "text-white/40 hover:text-white")}>
                  <Heart size={isFullscreen ? 32 : 20} fill={isLiked ? "currentColor" : "none"} />
                </button>
                
                <div className={cn("flex items-center gap-3 group", !isFullscreen && "hidden lg:flex")}>
                  <button onClick={handleToggleMute} className="text-white/40 hover:text-white transition-colors">
                    {volume === 0 || isMuted ? <VolumeX size={isFullscreen ? 28 : 18} /> : <Volume2 size={isFullscreen ? 28 : 18} />}
                  </button>
                  <div 
                    onClick={handleVolumeChange}
                    className={cn(
                      "bg-white/10 rounded-full overflow-hidden cursor-pointer",
                      isFullscreen ? "w-32 h-2" : "w-24 h-1.5"
                    )}
                  >
                    <div 
                      className="h-full bg-indigo-500/60"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={20} />}
                </button>
              </div>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
