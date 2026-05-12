import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic, Settings, Mic2, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Heart, label: 'Liked Songs', path: '/liked' },
  { icon: Library, label: 'Your Library', path: '/library' },
];

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col p-6 h-full border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:flex">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-indigo-500/20">
          <img src="/logo.png" alt="Emity" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase">
          Emity
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 mb-4">Discover</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
              isActive 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={18} className={cn("transition-transform group-hover:scale-110 duration-300 opacity-80")} />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-8 mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-4 mb-4">Collections</p>
          <NavLink
            to="/playlists"
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
              isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <ListMusic size={18} className="opacity-80" />
            <span className="font-medium text-sm">Playlists</span>
          </NavLink>
        </div>
      </nav>

      <div className="mt-auto space-y-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
          <div className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest">Upgrade</div>
          <div className="text-sm font-medium mb-3 leading-relaxed text-white/90">Get Hi-Fi audio quality with Premium.</div>
          <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98]">
            Upgrade Now
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300",
              isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings size={18} className="opacity-80" />
            <span className="font-medium text-sm">Settings</span>
          </NavLink>

          <div className="px-4 py-2 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              Created by <span className="text-indigo-400">WaizMarco</span><br />
              for you all by love
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
