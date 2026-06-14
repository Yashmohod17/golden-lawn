'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, GlassWater, Heart, Gift, 
  Crown, Briefcase, Utensils, Paintbrush, 
  Flower, Disc, Camera, Users, Lightbulb, CalendarRange 
} from 'lucide-react';
import { useInquiry } from '../../context/InquiryContext';

const services = [
  {
    icon: Sparkles,
    title: 'Wedding Planning',
    desc: 'End-to-end wedding theme design, vendor alignment, rehearsal schedule management, and detailed execution planning.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: GlassWater,
    title: 'Reception Arrangements',
    desc: 'Grand seating plans, customized reception stage backdrop layouts, entry pathways, and customized guest lounge zones.',
    image: 'https://images.unsplash.com/photo-1505232458729-565772b74dd7?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Heart,
    title: 'Engagement Ceremonies',
    desc: 'Sophisticated ring ceremony setups with elegant audio-visual structures, rose arches, and cozy guest sitting blocks.',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Gift,
    title: 'Birthday Celebrations',
    desc: 'Fun-filled birthday sets, customized cake display tables, interactive photo backdrops, and child activity zones.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Crown,
    title: 'Anniversary Functions',
    desc: 'Milestone anniversary setups emphasizing couple themes, romantic low lights, and elegant stage designs.',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Briefcase,
    title: 'Corporate Events',
    desc: 'Professional stage arrangements for company gala dinners, launches, and audio-visually equipped press conferences.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Utensils,
    title: 'Catering Services',
    desc: 'Signature multi-cuisine culinary menus with customized appetizer live counters and sweet arrays.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Paintbrush,
    title: 'Stage Decoration',
    desc: 'Breathtaking designer backdrop layouts, royal seating setups, led mapping frames, and custom pillars.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Flower,
    title: 'Floral Decoration',
    desc: 'Imported fresh flowers installations, path arches, dinner table vases, and hanging floral ceilings.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Disc,
    title: 'DJ and Sound System',
    desc: 'High-definition sound output, professional DJs, dynamic track lists, and stage smoke controllers.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Camera,
    title: 'Photography & Video',
    desc: 'Candid pre-wedding photoshoots, drone highlight reels, cinematic editing, and online albums.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Users,
    title: 'Guest Management',
    desc: 'Valet parking management, custom guest greetings, registration desks, and private luxury suite allocations.',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: Lightbulb,
    title: 'Luxury Lighting Setup',
    desc: 'Fairy lights, glowing spotlights, customized stage mapping, and warm table ambient fixtures.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop'
  },
  {
    icon: CalendarRange,
    title: 'Event Coordination',
    desc: 'On-site coordinators managing schedule timelines, food timings, and tech control stations.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function Services() {
  const { openInquiry } = useInquiry();

  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Elite Offerings
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Premium Event Services
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/60 leading-relaxed">
          From majestic floral structures to multi-cuisine dining lists, we handle every detail of your special event to golden perfection.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="glass-card rounded-3xl overflow-hidden border border-gold-400/10 flex flex-col justify-between"
            >
              {/* Service Visual Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{ backgroundImage: `url(${service.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-zinc-950">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Service Description */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-sm text-foreground/75 dark:text-foreground/60 leading-relaxed mb-6">
                  {service.desc}
                </p>

                <button
                  onClick={() => openInquiry(service.title)}
                  className="w-full rounded-xl border border-gold-400/30 text-gold-500 py-3 font-sans text-xs font-bold tracking-widest uppercase hover:bg-gold-400 hover:text-zinc-950 transition-all duration-300"
                >
                  Inquire Service
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
