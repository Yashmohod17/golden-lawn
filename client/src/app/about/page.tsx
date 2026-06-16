'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, History, Target, Compass, Award, UserCheck } from 'lucide-react';

const timeline = [
  {
    year: '2016',
    title: 'The Foundation',
    desc: 'Acquired 5 acres of premium space and laid down the green sod, establishing the first luxury lawn in the suburb.',
  },
  {
    year: '2019',
    title: 'Grand Expansion',
    desc: 'Upgraded infrastructure, adding full power backup, an adjacent parking lot, and luxury air-conditioned groom suites.',
  },
  {
    year: '2022',
    title: 'Award of Excellence',
    desc: 'Awarded "Top Outdoor Premium Venue" for hosting over 300+ destination weddings and international corporate events.',
  },
  {
    year: '2026',
    title: 'The Modern Era',
    desc: 'Integrated smart ambient lighting, dynamic floral stage structures, and custom-catered dining kitchens.',
  },
];

export default function About() {
  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Our Story
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          About The Golden Celebrations Lawn
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
          Crafting majestic memories for a decade. Learn about our journey, our commitment to event excellence, and our customer-first philosophy.
        </p>
      </div>

      {/* Grid: Journey & Visual representation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Our Journey to Perfection
            </h2>
            <p className="text-sm md:text-base text-foreground/75 dark:text-foreground/80 leading-relaxed">
              Founded in 2016, The Golden Celebrations Lawn was born out of a desire to create a wedding space that combines the grandeur of nature with the comfort of premium banquet halls.
            </p>
            <p className="text-sm md:text-base text-foreground/75 dark:text-foreground/80 leading-relaxed">
              We started with a simple belief: every occasion is a landmark in a family’s history. From floral arches to customized gourmet cuisines, we dedicated ourselves to executing details to absolute perfection.
            </p>
            
            {/* Core Values grid */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-foreground">Excellence</h4>
                <p className="text-xs text-foreground/60">Every detail curated to unmatched gold standards.</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-foreground">Customer First</h4>
                <p className="text-xs text-foreground/60">Tailoring menus and themes to individual wishes.</p>
              </div>
            </div>
          </motion.div>

          {/* Luxury Graphic/Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-96 sm:h-[450px] rounded-3xl overflow-hidden border border-gold-400/20 shadow-2xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="text-[10px] tracking-widest uppercase text-gold-300 font-sans">The Grand Lawn</span>
              <h4 className="font-serif text-2xl font-bold tracking-wide mt-1">Starlight Celebrations Venue</h4>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vision & Mission Row */}
      <div className="bg-gold-400/5 dark:bg-zinc-900/30 py-20 px-4 sm:px-6 lg:px-8 border-y border-gold-400/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Vision Card */}
          <div className="glass-card rounded-2xl p-8 flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75 dark:text-foreground/80">
                To be recognized globally as the premier outdoor event venue, setting benchmarks in luxurious hospitality, sustainable environmental management, and bespoke celebrations.
              </p>
            </div>
          </div>
          {/* Mission Card */}
          <div className="glass-card rounded-2xl p-8 flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75 dark:text-foreground/80">
                To turn celebrations into timeless memories by providing pristine, spacious lawns, state-of-the-art intelligent lighting setups, gourmet culinary delights, and dedicated operational support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Evolution
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Our Historic Path
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Timeline Grid */}
        <div className="relative border-l border-gold-400/20 max-w-3xl mx-auto pl-6 md:pl-8 space-y-12">
          {timeline.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[35px] md:-left-[43px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-zinc-950 shadow-md">
                <History className="h-3.5 w-3.5" />
              </div>

              {/* Content Panel */}
              <div className="glass-card rounded-2xl p-6">
                <span className="font-serif text-lg font-bold text-gold-500">{item.year}</span>
                <h3 className="font-serif text-xl font-bold text-foreground mt-1 tracking-wide">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75 dark:text-foreground/80">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
