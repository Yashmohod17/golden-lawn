'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mimic initialization loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ivory-50 dark:bg-[#060606]"
        >
          {/* Decorative Ring */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute h-24 w-24 rounded-full border-2 border-dashed border-gold-400/30"
            />
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute h-28 w-28 rounded-full border-t border-b border-gold-400/50"
            />

            {/* Glowing Center Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-3xl font-serif font-bold text-zinc-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              G
            </motion.div>
          </div>

          {/* Luxury Text Animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-center"
          >
            <h1 className="font-serif text-2xl font-bold tracking-widest text-foreground uppercase">
              The Golden Celebrations
            </h1>
            <p className="mt-2 text-xs tracking-[0.25em] text-gold-500 font-sans uppercase">
              Premium Event Lawn & Venue
            </p>
          </motion.div>

          {/* Fine accent line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 150 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
