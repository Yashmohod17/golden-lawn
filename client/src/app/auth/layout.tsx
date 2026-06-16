'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center bg-ivory-50 dark:bg-zinc-950 px-4 py-16 overflow-hidden">
      
      {/* Premium ambient light spots */}
      <div className="absolute top-1/6 left-1/5 h-96 w-96 rounded-full bg-gold-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/5 h-96 w-96 rounded-full bg-burgundy-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold-300/3 blur-[150px] pointer-events-none" />

      {/* Back to Home Logo */}
      <div className="mb-8 z-10">
        <Link href="/" className="flex items-center gap-2 group justify-center">
          <span className="font-serif text-2xl font-bold tracking-widest text-foreground transition-colors group-hover:text-gold-400">
            GOLDEN
          </span>
          <span className="h-5 w-[1px] bg-gold-400" />
          <span className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">
            Celebrations
          </span>
        </Link>
        <p className="mt-2 text-[10px] text-foreground/40 text-center tracking-[0.15em] uppercase flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold-500" />
          Where Every Milestone Glimmers
        </p>
      </div>

      {/* Main Card Slot */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
