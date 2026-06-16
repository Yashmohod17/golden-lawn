'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';

export function BackToTop() {
  const scrollY = useScrollPosition();
  const isVisible = scrollY > 500;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/20 bg-ivory-100 text-gold-600 shadow-lg backdrop-blur-md transition-colors hover:border-gold-400/50 hover:bg-gold-400 hover:text-zinc-950 dark:bg-zinc-900 dark:text-gold-400 dark:hover:bg-gold-400 dark:hover:text-zinc-950"
          aria-label="Scroll back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
