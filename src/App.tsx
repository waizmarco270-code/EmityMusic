import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Player } from './components/Player';
import { AudioEngine } from './components/AudioEngine';
import { UnlockScreen } from './components/UnlockScreen';
import { useAuthStore } from './store/useAuthStore';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { LikedSongs } from './pages/LikedSongs';
import { Playlists } from './pages/Playlists';
import { Settings } from './pages/Settings';
import { MobileNav } from './components/MobileNav';

export default function App() {
  const isUnlocked = useAuthStore((state) => state.isUnlocked);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
        <AudioEngine />
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <TopNav />
          
          <main className="flex-1 overflow-y-auto scroll-smooth relative no-scrollbar">
            <AnimatePresence>
              {deferredPrompt && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-indigo-600 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/20"
                  >
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Install EmityMusic</p>
                      <p className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Fast • Offline • Seamless</p>
                    </div>
                    <button 
                      onClick={handleInstall}
                      className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-transform"
                    >
                      INSTALL
                    </button>
                    <button 
                      onClick={() => setDeferredPrompt(null)}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            <div className="atmosphere" />
            <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10 pb-40 md:pb-40">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/liked" element={<LikedSongs />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>

        <Player />
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
