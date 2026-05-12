import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function UnlockScreen() {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const unlock = useAuthStore((state) => state.unlock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(key)) {
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden mx-auto mb-8 shadow-2xl relative group"
          >
            <img src="/logo.png" alt="Emity Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">EmityMusic</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Private Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input 
              type="password"
              placeholder="Enter Access Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 text-white outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all text-center tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-white/20`}
            />
            <AnimatePresence>
              {key && (
                <motion.button 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <ArrowRight size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-red-400 text-xs text-center font-medium"
              >
                Invalid access key. Please try again.
              </motion.p>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-widest"
              >
                <ShieldCheck size={12} strokeWidth={3} />
                Encrypted Session
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-20 text-center">
          <p className="text-white/20 text-[10px] font-medium leading-relaxed">
            By entering the key, you agree to our terms of service.<br />
            Emity Engine v2.4.0 • Prototype Stage
          </p>
        </div>
      </motion.div>
    </div>
  );
}
