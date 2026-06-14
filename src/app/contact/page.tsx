'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send } from 'lucide-react';
import { CostEstimator } from '../../components/CostEstimator';
import { CalendarChecker } from '../../components/CalendarChecker';

export default function Contact() {
  const whatsappNumber = '919876543210';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20booking%20availability%20for%20an%20event.`;

  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Connect With Us
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Contact & Booking Inquiry
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/60 leading-relaxed">
          Ready to schedule your dream celebration? Reach out to our events desk, estimate your budget, check date availability, or drop an inquiry.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Column 1: Contact Details & Map */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Contact Details Card */}
            <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 md:p-8 space-y-6 shadow-md">
              <h3 className="font-serif text-2xl font-bold text-foreground">Venue Desk</h3>
              
              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Location Address</span>
                    <span className="text-foreground/70 dark:text-foreground/55 mt-1 block leading-relaxed">
                      Golden Celebrations Lawn, Narsala Road, Near Hudkeshwar, Nagpur, MH - 440034
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Phone Number</span>
                    <span className="text-foreground/70 dark:text-foreground/55 mt-1 block">
                      +91 98765 43210
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Email Address</span>
                    <span className="text-foreground/70 dark:text-foreground/55 mt-1 block">
                      info@goldencelebrations.com
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">Working Hours</span>
                    <span className="text-foreground/70 dark:text-foreground/55 mt-1 block">
                      Mon - Sun: 9:00 AM - 8:00 PM
                    </span>
                  </div>
                </li>
              </ul>

              {/* Chat on WhatsApp */}
              <div className="pt-4 border-t border-gold-400/10">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold font-sans tracking-widest text-white uppercase shadow-md transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Chat Desk
                </a>
              </div>
            </div>

            {/* Google Map Mock Card */}
            <div className="rounded-3xl overflow-hidden border border-gold-400/15 h-64 shadow-md relative group">
              <iframe
                title="Golden Celebrations Venue Map"
                src="https://maps.google.com/maps?q=Narsala,%20Nagpur&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="grayscale dark:invert contrast-125 brightness-90 group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gold-400/20 text-white text-[10px] tracking-wider uppercase font-sans font-bold">
                Nagpur Venue Location
              </div>
            </div>

          </div>

          {/* Columns 2 & 3: Calendar Availability and Cost Estimator Panels */}
          <div className="lg:col-span-2 space-y-8">
            {/* Calendar Availability Card */}
            <CalendarChecker />

            {/* Event cost Estimator */}
            <CostEstimator />

            {/* Quick Contact Form */}
            <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 md:p-8 shadow-md">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Send a Direct Message</h3>
              <p className="text-xs text-foreground/60 mb-6">If you have customized concerns or general inquiries, write us a letter directly.</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Your message has been sent to our events desk.');
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
                />
                <textarea
                  required
                  placeholder="Your Message..."
                  rows={4}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
                />
                
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-3 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
