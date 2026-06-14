'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { ThemeToggle } from './ThemeToggle';
import { useInquiry } from '../context/InquiryContext';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Packages', href: '/packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQs', href: '/#faqs' },
  { label: 'Contact Us', href: '/contact' },
];

export function Navbar() {
  const scrollY = useScrollPosition();
  const pathname = usePathname();
  const { openInquiry } = useInquiry();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(scrollY > 50);
  }, [scrollY]);

  // Close mobile menu on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-ivory-100/85 shadow-lg backdrop-blur-md dark:bg-zinc-950/85 border-b border-gold-400/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-widest text-foreground transition-colors group-hover:text-gold-400">
              GOLDEN
            </span>
            <span className="h-5 w-[1px] bg-gold-400" />
            <span className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">
              Celebrations
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href.startsWith('/#') && pathname === '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative text-sm font-medium tracking-wide uppercase transition-colors hover:text-gold-400 ${
                      isActive ? 'text-gold-400' : 'text-foreground/80'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={() => openInquiry()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md transition-all hover:shadow-gold-400/20"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book Event
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full p-2 text-foreground/85 transition-colors hover:bg-gold-400/10 hover:text-gold-400"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gold-400/10 bg-ivory-100 dark:bg-zinc-950 px-4 pt-4 pb-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href.startsWith('/#') && pathname === '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-semibold tracking-wider uppercase transition-colors hover:text-gold-400 ${
                      isActive ? 'text-gold-400' : 'text-foreground/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="h-[1px] bg-gold-400/10 my-2" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  openInquiry();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 py-3 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md"
              >
                <Calendar className="h-4 w-4" />
                Book Event
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
