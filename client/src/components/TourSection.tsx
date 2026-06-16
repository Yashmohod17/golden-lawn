'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Volume2, VolumeX } from 'lucide-react';

export function TourSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-lawn-41740-large.mp4';
  const posterUrl = 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1600&auto=format&fit=crop';

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-50 dark:bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Experience the Space
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl md:text-5xl">
            Virtual Venue Tour
          </h2>
          <div className="luxury-divider" />
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-foreground/70 dark:text-foreground/80">
            Take a cinematic walk through our manicured gardens, stunning dining arrays, and high-end staging setups.
          </p>
        </div>

        {/* Video Player Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-gold-400/20 shadow-2xl group"
        >
          {/* Static Preview Frame */}
          <div
            className="w-full aspect-video bg-cover bg-center flex items-center justify-center relative"
            style={{ backgroundImage: `url(${posterUrl})` }}
          >
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-500" />

            {/* Pulsing Play Button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="relative z-10 h-20 w-20 rounded-full bg-gold-400 text-zinc-950 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-pulse-gold focus:outline-none"
              aria-label="Play virtual tour video"
            >
              <Play className="h-8 w-8 fill-zinc-950 ml-1" />
            </button>
            
            <span className="absolute bottom-6 left-6 z-10 text-xs tracking-widest text-white/80 font-sans uppercase">
              Duration: 0:45 mins
            </span>
          </div>
        </motion.div>

        {/* Full-Screen Video Modal overlay */}
        <AnimatePresence>
          {isPlaying && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                onClick={() => setIsPlaying(false)}
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl z-10 border border-gold-400/20"
              >
                {/* Video Player */}
                <video
                  src={videoUrl}
                  autoPlay
                  controls
                  loop
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />

                {/* Video HUD Close Controls */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full bg-black/60 text-white border border-white/10 hover:bg-gold-400 hover:text-zinc-950 transition-colors"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="p-2.5 rounded-full bg-black/60 text-white border border-white/10 hover:bg-gold-400 hover:text-zinc-950 transition-colors"
                    aria-label="Close video player"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
