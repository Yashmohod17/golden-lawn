'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useInquiry } from '../lib/InquiryContext';

const categories = [
  {
    title: 'Weddings',
    desc: 'Exchange vows in a fairytale setting surrounded by premium floral design and lush greens.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Receptions',
    desc: 'Grand starlight receptions featuring designer lighting setups and gourmet catering arrays.',
    image: 'https://images.unsplash.com/photo-1505232458729-565772b74dd7?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Engagements',
    desc: 'Intimate rings exchanging celebrations crafted with classy seating and live music setups.',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Birthday Parties',
    desc: 'High energy birthday celebrations for all ages with customized theme decoration elements.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Corporate Events',
    desc: 'Premium banqueting setups for company award dinners, conferences, and brand launches.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Anniversaries',
    desc: 'Celebrate beautiful years of togetherness in an ambiance carrying romance and history.',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Family Gatherings',
    desc: 'Reunions and festive gatherings equipped with guest service suites and child-friendly play areas.',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Cultural Functions',
    desc: 'Sangeet sandhyas, musical programs, and community celebrations built on grand stages.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export function EventCategories() {
  const { openInquiry } = useInquiry();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-100 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Signature Occasions
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl md:text-5xl">
            Event Categories
          </h2>
          <div className="luxury-divider" />
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-foreground/70 dark:text-foreground/80">
            From majestic wedding setups to corporate dinners, discover spaces shaped to host your most valued moments.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              onClick={() => openInquiry(cat.title)}
              className="group relative h-96 overflow-hidden rounded-2xl border border-gold-400/15 cursor-pointer shadow-lg"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

              {/* Content Panel */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
                <span className="text-gold-300 text-xs tracking-wider uppercase font-sans mb-1 font-medium">
                  The Lawn Venue
                </span>
                
                <h3 className="font-serif text-2xl font-bold tracking-wide flex items-center gap-1 group-hover:text-gold-300 transition-colors">
                  {cat.title}
                  <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0" />
                </h3>

                {/* Expanding Description Panel on Hover */}
                <div className="h-0 opacity-0 overflow-hidden transition-all duration-500 group-hover:h-20 group-hover:opacity-100 mt-2">
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {cat.desc}
                  </p>
                  <button className="mt-3 text-[10px] uppercase tracking-widest text-gold-400 font-bold hover:underline">
                    Inquire Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
