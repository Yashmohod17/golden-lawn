'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import Link from 'next/link';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop',
    title: 'Where Every Celebration Becomes a Golden Memory',
    subtitle: 'Experience luxury weddings, receptions, engagements, birthdays, and corporate events in a venue crafted for unforgettable moments.',
  },
  {
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1600&auto=format&fit=crop',
    title: 'An Enchanting Lawn Covered in Lights',
    subtitle: 'Our spacious premium lawn matches world-class decoration standards, setting the stage for elegant night receptions.',
  },
  {
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
    title: 'Exquisite Details & Unmatched Hospitality',
    subtitle: 'From customized catering support to flawless professional coordination, we ensure your event exceeds expectations.',
  },
];

interface Particle {
  id: number;
  width: string;
  height: string;
  left: string;
  top: string;
  duration: number;
  xOffset: number;
}

export function Hero() {
  const [current, setCurrent] = useState(0);
  const { openInquiry } = useInquiry();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles purely on the client side
    const generated = [...Array(15)].map((_, i) => ({
      id: i,
      width: Math.random() * 8 + 4 + 'px',
      height: Math.random() * 8 + 4 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      duration: Math.random() * 10 + 10,
      xOffset: Math.random() * 40 - 20,
    }));
    setParticles(generated);

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black flex items-center justify-center">
      
      {/* Background Image Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        >
          {/* Elegant Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Animated Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gold-300/30"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, p.xOffset, 0],
              opacity: [0.1, 0.7, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-gold-400 animate-pulse" />
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-gold-300 uppercase">
            Premium Wedding & Event Venue
          </span>
        </motion.div>

        {/* Headline */}
        <div className="overflow-hidden min-h-[5rem] md:min-h-[8rem] flex items-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={current}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-3xl font-bold tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
            >
              {slides[current].title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Decorative Luxury Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="luxury-divider w-40 my-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-400 block" />
        </motion.div>

        {/* Subheadline */}
        <div className="overflow-hidden min-h-[4rem] sm:min-h-[3rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mx-auto max-w-2xl text-sm text-zinc-300 sm:text-base md:text-lg leading-relaxed font-sans"
            >
              {slides[current].subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => openInquiry()}
            className="rounded-full bg-gradient-to-r from-gold-600 to-gold-400 px-8 py-4 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-xl shadow-gold-600/20 hover:from-gold-500 hover:to-gold-300 hover:scale-[1.03] transition-all duration-300"
          >
            Book Your Event
          </button>
          <Link
            href="/gallery"
            className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-sans text-xs font-bold tracking-widest text-white uppercase backdrop-blur-sm hover:bg-white/15 hover:border-white/40 hover:scale-[1.03] transition-all duration-300"
          >
            Explore Gallery
          </Link>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-gold-400 hover:text-zinc-950 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-gold-400 hover:text-zinc-950 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slider Indicators */}
      <div className="absolute bottom-10 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all rounded-full ${
              current === i ? 'w-8 bg-gold-400' : 'w-2 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
