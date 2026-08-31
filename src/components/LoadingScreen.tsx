import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div id="loading_screen_container" className="min-h-screen w-full bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-[var(--text-secondary)] theme-transition">
      {/* Dynamic ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Background ambient glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none"></div>

      <motion.div
        id="loading_card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center relative z-10 max-w-sm"
      >
        {/* Animated Brand Emblem */}
        <div id="loading_brand_emblem" className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] relative z-10"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
          </motion.div>
        </div>

        {/* Display Typography */}
        <h1 id="loading_title" className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-2 font-sans flex items-center gap-1.5">
          StudentOS <span className="text-violet-400 text-xs px-2 py-0.5 rounded-full bg-violet-950/40 border border-violet-800/30 font-mono font-medium uppercase tracking-wider">v2.1</span>
        </h1>
        
        <p id="loading_subtitle" className="text-xs text-[var(--text-muted)] font-mono tracking-wider uppercase mb-8">
          Synchronizing Scholar Workspace
        </p>

        {/* Elegant Progress Indicator */}
        <div id="loading_progress_container" className="w-48 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-primary)]/40 mb-3">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="relative h-full w-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
          />
        </div>

        <p id="loading_status_text" className="text-[10px] text-[var(--text-dimmed)] font-mono animate-pulse">
          Establishing Secure Firebase Session...
        </p>
      </motion.div>

      {/* Decorative branding footnote */}
      <div id="loading_footer" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[8px] text-[var(--text-faint)] font-mono tracking-widest uppercase">
          StudentOS AI Security hardened Ruleset
        </p>
      </div>
    </div>
  );
}
