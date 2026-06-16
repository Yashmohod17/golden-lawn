'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, FileText, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { usePortal } from '../../../lib/PortalContext';
import { useInquiry } from '../../../lib/InquiryContext';
import { EditBookingModal } from '../../../components/EditBookingModal';

type BookingFilter = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function MyBookings() {
  const { bookings } = usePortal();
  const { openInquiry } = useInquiry();
  const [activeTab, setActiveTab] = useState<BookingFilter>('ALL');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');

  const getFilteredBookings = () => {
    const today = new Date();
    return bookings.filter((b) => {
      if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
      if (activeTab === 'UPCOMING') return b.status !== 'CANCELLED' && new Date(b.date) >= today;
      if (activeTab === 'PAST') return b.status !== 'CANCELLED' && new Date(b.date) < today;
      return true; // 'ALL'
    });
  };

  const filtered = getFilteredBookings();

  const tabs: { key: BookingFilter; label: string }[] = [
    { key: 'ALL', label: 'All Events' },
    { key: 'UPCOMING', label: 'Upcoming' },
    { key: 'PAST', label: 'Past Events' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            My Bookings
          </h1>
          <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            View timelines, stages, invoice details, and customization options
          </p>
        </div>
        <button
          onClick={() => openInquiry()}
          className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md hover:from-gold-500 hover:to-gold-300 transition-all cursor-pointer"
        >
          + Request New Booking
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-gold-400/10 gap-2 overflow-x-auto no-scrollbar pt-2 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key 
                ? 'text-gold-500 font-bold' 
                : 'text-foreground/50 hover:text-foreground/80'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.span
                layoutId="activePortalBookingTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-400 rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((booking) => {
            const isPast = new Date(booking.date) < new Date();
            
            return (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="glass-card rounded-3xl p-6 border border-gold-400/15 flex flex-col justify-between hover:border-gold-400/35 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Card Header: Event Type & Status */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {booking.eventType}
                      </h3>
                      <span className="text-[10px] text-foreground/40 font-mono">Booking ID: {booking.id}</span>
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                      booking.status === 'CONFIRMED'
                        ? isPast 
                          ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>
                      {booking.status === 'CONFIRMED' && isPast ? 'PAST EVENT' : booking.status}
                    </span>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 gap-4 border-y border-gold-400/5 py-4">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-gold-500 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Event Date</span>
                        <span className="block text-[11px] font-semibold text-foreground">{booking.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-gold-500 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Guest List</span>
                        <span className="block text-[11px] font-semibold text-foreground">{booking.guests} Guests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-gold-500 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Venue Spot</span>
                        <span className="block text-[11px] font-semibold text-foreground truncate max-w-[120px]">{booking.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-gold-500 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Total Cost</span>
                        <span className="block text-[11px] font-semibold text-gold-600 dark:text-gold-400">₹{booking.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  <p className="text-[11px] leading-relaxed text-foreground/60 italic line-clamp-2">
                    &ldquo;{booking.notes}&rdquo;
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-6 pt-4 border-t border-gold-400/5 flex justify-between items-center">
                  <div className="text-[10px] text-foreground/40 font-medium">
                    {booking.status === 'CANCELLED' ? (
                      <span>Cancelled / Inactive</span>
                    ) : booking.pending > 0 ? (
                      <span className="text-burgundy-600 dark:text-burgundy-400 font-semibold">₹{booking.pending.toLocaleString()} due</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Fully Cleared</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {booking.status !== 'CANCELLED' && !isPast && (
                      <button 
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setIsEditOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-gold-400/10 hover:border-gold-400 bg-white dark:bg-zinc-900 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground hover:text-gold-500 transition-all cursor-pointer"
                      >
                        <span>Edit</span>
                      </button>
                    )}
                    <Link 
                      href={`/portal/bookings/${booking.id}`}
                      className="flex items-center gap-1.5 rounded-xl border border-gold-400/10 hover:border-gold-400 bg-white dark:bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground hover:text-gold-500 transition-all cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-3 w-3 text-gold-400" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-dashed border-gold-400/20 p-8 space-y-4">
            <Calendar className="h-10 w-10 text-gold-400 mx-auto opacity-60" />
            <h3 className="font-serif text-lg font-bold text-foreground">No bookings found</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              There are no event reservations matching this filter. Let us know if you want to book a new luxury celebration event!
            </p>
            <button
              onClick={() => openInquiry()}
              className="rounded-full bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-2.5 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md cursor-pointer"
            >
              Inquire Availability
            </button>
          </div>
        )}
      </div>

      <EditBookingModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        bookingId={selectedBookingId} 
      />
    </div>
  );
}
