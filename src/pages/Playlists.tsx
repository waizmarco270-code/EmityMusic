import React, { useState, useEffect } from 'react';
import { Plus, ListMusic, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { db } from '../lib/db';
import { Playlist } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    db.playlists.toArray().then(setPlaylists);
  }, []);

  const createPlaylist = async () => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name: `My Playlist #${playlists.length + 1}`,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.playlists.add(newPlaylist);
    setPlaylists([...playlists, newPlaylist]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Your Playlists</h1>
          <p className="text-white/40 text-sm">{playlists.length} total collections</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              onClick={() => setIsGridView(true)}
              className={cn("p-2 rounded-lg transition-all", isGridView ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setIsGridView(false)}
              className={cn("p-2 rounded-lg transition-all", !isGridView ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={createPlaylist}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <Plus size={20} />
            Create
          </button>
        </div>
      </div>

      {isGridView ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist, i) => (
            <motion.div 
              key={playlist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square rounded-[32px] bg-gradient-to-br from-white/10 to-transparent p-1 mb-4 flex items-center justify-center relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-white/5 transition-all duration-500">
                <ListMusic size={60} className="text-white/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MoreHorizontal className="text-white" />
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1 group-hover:text-orange-500 transition-colors">{playlist.name}</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{playlist.trackIds.length} tracks</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
           {/* List View placeholder */}
        </div>
      )}
    </div>
  );
}
