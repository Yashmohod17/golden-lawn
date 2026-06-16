'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Maximize2, Sparkles, Car, ShieldCheck, 
  Paintbrush, UtensilsCrossed, Lightbulb, Camera 
} from 'lucide-react';

const features = [
  {
    icon: Maximize2,
    title: 'Spacious Premium Lawn',
    desc: 'Spread across lush green acres, hosting up to 2,000 guests comfortably under open skies.',
  },
  {
    icon: Sparkles,
    title: 'Elegant Event Setup',
    desc: 'Exquisite pre-event arrangements tailored to classic, bohemian, and modern luxury themes.',
  },
  {
    icon: Car,
    title: 'Valet & Parking Facility',
    desc: 'Spacious, secure vehicle parking lot accommodating 300+ cars with dedicated valet assistance.',
  },
  {
    icon: ShieldCheck,
    title: 'Professional Management',
    desc: 'Our experienced in-house coordinators handle timeline and vendors flawlessly.',
  },
  {
    icon: Paintbrush,
    title: 'Customized Decoration',
    desc: 'Stunning floral structures, grand backdrops, and table layouts crafted by top designers.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Catering Support',
    desc: 'Multicuisine catering options serving fresh, premium-quality signature dishes.',
  },
  {
    icon: Lightbulb,
    title: 'Modern Intelligent Lighting',
    desc: 'Intelligent light fixtures, spotlights, and fairy light networks setting a premium ambiance.',
  },
  {
    icon: Camera,
    title: 'Photography Assistance',
    desc: 'Curated list of professional candid wedding photographers and videographers.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
} as const;

export function WhyChooseUs() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-ivory-50 dark:bg-[#0A0A0A] overflow-hidden">
      
      {/* Decorative background shape */}
      <div className="absolute top-1/4 left-0 h-96 w-96 rounded-full bg-gold-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-burgundy-500/3 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Exclusive Amenities
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl md:text-5xl">
            Why Plan With Us
          </h2>
          <div className="luxury-divider" />
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-foreground/70">
            Every detail is meticulously planned to deliver a premium, worry-free celebration experience for you and your guests.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                {/* Icon Wrapper */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500 dark:bg-gold-400/5">
                  <feature.icon className="h-6 w-6" />
                </div>
                {/* Text content */}
                <h3 className="font-serif text-xl font-semibold text-foreground tracking-wide">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              {/* Accent bottom bar on hover */}
              <div className="mt-6 h-[2px] w-8 bg-gold-400/30 transition-all group-hover:w-full group-hover:bg-gold-400" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
