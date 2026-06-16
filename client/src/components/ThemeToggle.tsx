'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Correct initial preference checks from localStorage or media query
    const localTheme = localStorage.getItem('theme');
    const isDark = localTheme === 'dark' || 
                   (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-full w-9 h-9 flex items-center justify-center text-foreground/80 transition-colors hover:bg-gold-400/10 hover:text-gold-400"
      aria-label="Toggle dark/light theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute flex items-center justify-center"
      >
        <Sun className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? -180 : 0, scale: theme === 'light' ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute flex items-center justify-center"
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </button>
  );
}
