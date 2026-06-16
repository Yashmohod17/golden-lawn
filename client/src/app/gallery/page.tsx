'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Search } from 'lucide-react';

const categories = [
  'All',
  'Weddings',
  'Receptions',
  'Engagements',
  'Birthdays',
  'Corporate Events',
  'Decorations',
  'Night View',
  'Stage Designs',
];

const galleryItems = [
  {
    id: 1,
    category: 'Weddings',
    title: 'Fairytale Flower Arch Ceremony',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
  },
  {
    id: 2,
    category: 'Night View',
    title: 'Lawn Lighting Illuminations',
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-video',
  },
  {
    id: 3,
    category: 'Decorations',
    title: 'Golden Table Dinner Setup',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
  {
    id: 4,
    category: 'Receptions',
    title: 'Canopy Glow Lounge Zone',
    image: 'https://images.unsplash.com/photo-1505232458729-565772b74dd7?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
  },
  {
    id: 5,
    category: 'Stage Designs',
    title: 'Bespoke Floral Royal Stage',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 6,
    category: 'Engagements',
    title: 'Classy Ring Exchanging Stage',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
  },
  {
    id: 7,
    category: 'Birthdays',
    title: 'Vibrant Theme Balloon Backdrop',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
  {
    id: 8,
    category: 'Corporate Events',
    title: 'Annual Awards Gala Dining Room',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-video',
  },
  {
    id: 9,
    category: 'Weddings',
    title: 'Ivory Walkway Petals Alignment',
    image: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev! === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev! === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Visual Memories
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Event Gallery
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
          Walk through our real-life portfolios. Sort highlights of wedding tables, starlight gardens, design stages, and family gatherings.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-12 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`rounded-full px-5 py-2 font-sans text-xs font-bold tracking-wider uppercase transition-all ${
              activeFilter === cat
                ? 'bg-gold-400 text-zinc-950 shadow-md shadow-gold-400/10'
                : 'border border-gold-400/10 bg-white dark:bg-zinc-900 text-foreground/75 hover:border-gold-400/35'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-like Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setLightboxIndex(idx)}
                className={`break-inside-avoid relative rounded-2xl overflow-hidden border border-gold-400/15 cursor-pointer shadow-md group ${item.aspect}`}
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                />

                {/* Dark Shroud Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6" />

                {/* Text Indicator Panel */}
                <div className="absolute inset-x-0 bottom-0 p-6 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-white">
                  <span className="text-[10px] tracking-widest text-gold-300 font-sans uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold tracking-wide mt-1 flex items-center gap-1.5 justify-between">
                    {item.title}
                    <ZoomIn className="h-4 w-4 text-gold-400" />
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full-Screen Lightbox modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none">
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setLightboxIndex(null)} />

            {/* Lightbox Shell */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center z-10"
            >
              <img
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg border border-gold-400/15"
              />

              {/* Title info */}
              <div className="text-center text-white mt-4 space-y-1">
                <span className="text-xs text-gold-300 font-sans tracking-widest uppercase">
                  {filteredItems[lightboxIndex].category}
                </span>
                <h3 className="font-serif text-lg font-semibold tracking-wide">
                  {filteredItems[lightboxIndex].title}
                </h3>
                <p className="text-[10px] text-white/50 font-sans">
                  {lightboxIndex + 1} of {filteredItems.length}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-gold-400 transition-colors"
                aria-label="Close Lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Left Navigation */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white hover:bg-gold-400 hover:text-zinc-950 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Right Navigation */}
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white hover:bg-gold-400 hover:text-zinc-950 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
