import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Bell, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
export function TopNav() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      // Standard search suggestions (simulated for internal library)
      const mockSuggestions = [
        `${val} radio`,
        `${val} hits`,
        `best of ${val}`,
        `${val} remix`,
        `${val} live`
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery(q);
    setIsFocused(false);
  };

  return (
    <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 z-40 sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex-1 max-w-xl relative">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10",
          "focus-within:bg-white/10 focus-within:border-indigo-500/30 transition-all duration-300 relative pl-10"
        )}>
          <SearchIcon size={14} className="absolute left-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search tracks or artists..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm placeholder:text-white/30"
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/40 hover:text-white mr-2">
              <X size={14} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isFocused && (suggestions.length > 0 || query) && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsFocused(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full mt-2 w-full bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 overflow-hidden z-50 shadow-[0_30px_70px_-10px_rgba(0,0,0,1)] ring-1 ring-white/5"
              >
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold px-3 py-2 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                    Smart Suggestions
                  </p>
                  <div className="space-y-0.5">
                    {suggestions.map((sug, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSearch(sug)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-sm transition-colors text-white/60 hover:text-white truncate"
                      >
                        {sug}
                      </button>
                    ))}
                    {suggestions.length === 0 && query && (
                      <button 
                        onClick={() => handleSearch(query)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-sm transition-colors text-white/60 hover:text-white"
                      >
                        Search for "{query}"
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-4">
        <button className="text-white/40 hover:text-white transition-colors hidden sm:block">
          <Bell size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full pl-1 pr-3 md:pr-4 py-1 hover:bg-white/10 transition-all cursor-pointer group">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 group-hover:scale-105 transition-transform" />
          <span className="text-[10px] md:text-sm font-semibold tracking-wide hidden xs:block text-white/80">DEV</span>
        </div>
      </div>
    </header>
  );
}
