'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { target: 1000, label: 'Events Hosted', suffix: '+' },
  { target: 500, label: 'Happy Families', suffix: '+' },
  { target: 10, label: 'Years Experience', suffix: '+' },
  { target: 100, label: 'Customer Satisfaction', suffix: '%' },
];

function Counter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    if (start === end) return;

    // Calculate step speed based on duration
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);

    const timer = setInterval(() => {
      start += 1;
      setCount(Math.min(start, end));
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function StatsSection() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-gold-900 to-zinc-950 text-white overflow-hidden">
      
      {/* Background Subtle Sparkle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="space-y-2"
            >
              {/* Counter Number */}
              <div className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gold-400">
                <Counter target={stat.target} />
                <span>{stat.suffix}</span>
              </div>
              
              {/* Divider */}
              <div className="mx-auto w-12 h-[1px] bg-gold-400/30" />

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm tracking-wider uppercase text-zinc-300 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
