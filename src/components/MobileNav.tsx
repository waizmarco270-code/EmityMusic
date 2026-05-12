import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, Library } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Heart, label: 'Liked', path: '/liked' },
  { icon: Library, label: 'Library', path: '/library' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-[100] px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-all duration-300 min-w-[64px]",
            isActive ? "text-indigo-400" : "text-white/40 hover:text-white"
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
