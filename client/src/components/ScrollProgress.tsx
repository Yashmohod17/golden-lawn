'use client';

import React from 'react';
import { motion, useScroll } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left bg-gradient-to-r from-gold-600 via-gold-400 to-gold-200"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
