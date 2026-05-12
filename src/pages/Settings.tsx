import React from 'react';
import { Settings as SettingsIcon, Monitor, Volume2, Shield, Trash2, Smartphone, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';

export function Settings() {
  const lock = useAuthStore((state) => state.lock);
  const sections = [
    { 
      icon: Monitor, 
      title: 'Appearance', 
      desc: 'Customize common looks and themes',
      options: [
        { label: 'AMOLED Mode', type: 'toggle', value: true },
        { label: 'Glassmorphism Effects', type: 'toggle', value: true },
        { label: 'Dynamic Backgrounds', type: 'toggle', value: false }
      ]
    },
    { 
      icon: Volume2, 
      title: 'Playback', 
      desc: 'Audio quality and behavior',
      options: [
        { label: 'Crossfade', type: 'toggle', value: false },
        { label: 'Audio Quality', type: 'select', value: 'High' },
        { label: 'Normalize Volume', type: 'toggle', value: true }
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <SettingsIcon size={24} className="text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Emity Settings</h1>
      </div>

      <div className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-indigo-500" />
            <div>
              <h2 className="text-xl font-bold">Access Security</h2>
              <p className="text-sm text-white/40">Manage your application session</p>
            </div>
          </div>
          <div className="glass-morphism rounded-3xl p-2">
            <button 
              onClick={lock}
              className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="text-left">
                <p className="font-bold text-white">Lock App Session</p>
                <p className="text-xs text-white/40">You'll need the master key to access again.</p>
              </div>
              <LogOut size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <section.icon size={20} className="text-indigo-500" />
              <div>
                <h2 className="text-xl font-bold">{section.title}</h2>
                <p className="text-sm text-white/40">{section.desc}</p>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl p-6 space-y-6">
              {section.options.map((opt, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">{opt.label}</span>
                  {opt.type === 'toggle' ? (
                    <div className={cn(
                      "w-11 h-6 rounded-full cursor-pointer transition-colors p-1",
                      opt.value ? 'bg-indigo-500' : 'bg-white/10'
                    )}>
                      <motion.div 
                        animate={{ x: opt.value ? 20 : 0 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{opt.value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="pt-10 space-y-4">
          <h3 className="text-rose-500 font-bold px-1 uppercase text-[10px] tracking-widest">Danger Zone</h3>
          <button className="w-full flex items-center justify-between p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group">
            <div className="text-left">
              <p className="font-bold text-rose-500">Delete Local Cache</p>
              <p className="text-xs text-rose-500/60">This will remove all downloaded metadata and history.</p>
            </div>
            <Trash2 size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="text-center py-10 opacity-30 hover:opacity-100 transition-opacity">
           <div className="flex flex-col items-center justify-center gap-3">
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
               <Smartphone size={14} />
               Emity v2.4.0 Engine
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
               Created by <span className="text-white">WaizMarco</span> for you all by love
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
