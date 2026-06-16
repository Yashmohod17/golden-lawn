'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Users, MapPin, Phone, MessageSquare, 
  Download, AlertTriangle, CheckCircle, Clock, FileText, ChevronRight, X, Check, Activity, Sparkles
} from 'lucide-react';
import { usePortal } from '../../../../lib/PortalContext';
import { EditBookingModal } from '../../../../components/EditBookingModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetails({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { bookings, cancelBooking } = usePortal();
  const [mounted, setMounted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const booking = bookings.find((b) => b.id === unwrappedParams.id);

  if (!mounted) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="h-10 w-10 text-burgundy-600 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-foreground">Booking not found</h3>
        <p className="text-xs text-foreground/50">The requested reservation ID could not be located.</p>
        <Link 
          href="/portal/bookings"
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-400 hover:text-zinc-950 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </div>
    );
  }

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    cancelBooking(booking.id);
    setShowCancelModal(false);
  };

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Simulate download trigger
      const link = document.createElement('a');
      link.href = '#';
      alert(`Statement generated for ${booking.id}. Simulated download complete!`);
    }, 1500);
  };

  // Status color helpers
  const isPast = new Date(booking.date) < new Date();

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Back Link */}
      <Link 
        href="/portal/bookings"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-gold-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 text-gold-400" />
        <span>Back to Reservations</span>
      </Link>

      {/* Main Header Banner */}
      <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
              booking.status === 'CONFIRMED'
                ? isPast 
                  ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : booking.status === 'CANCELLED'
                ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            }`}>
              {booking.status === 'CONFIRMED' && isPast ? 'PAST RESERVATION' : booking.status}
            </span>
            <span className="text-[10px] text-foreground/50 font-mono">ID: {booking.id}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {booking.eventType}
          </h1>
          <p className="text-xs text-foreground/60 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            {booking.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl border border-gold-400/20 bg-white dark:bg-zinc-900 hover:border-gold-400 px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:text-gold-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 text-gold-400" />
            <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
          </button>
          
          {booking.status !== 'CANCELLED' && !isPast && (
            <>
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl border border-gold-400/25 bg-white dark:bg-zinc-900 hover:border-gold-400 px-4.5 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:text-gold-500 transition-colors cursor-pointer"
              >
                <span>Edit Reservation</span>
              </button>
              <button
                onClick={handleCancelClick}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 px-4.5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Cancel Reservation</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 6-Stage Timeline Tracker */}
      <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-foreground">Booking Status Tracking</h3>
          <span className="text-[10px] text-foreground/50 tracking-wider uppercase flex items-center gap-1 font-bold">
            <Activity className="h-3.5 w-3.5 text-gold-500" />
            Stage Progress
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative pt-2">
          {/* Connecting line (Desktop Only) */}
          <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-0" />
          
          {(() => {
            const mList = booking.milestones || [];
            const siteVisitCompleted = mList.some(m => m.label.toLowerCase().includes('site visit') && m.status === 'COMPLETED');
            const designCompleted = mList.some(m => m.label.toLowerCase().includes('design') && m.status === 'COMPLETED');
            const depositCompleted = mList.some(m => m.label.toLowerCase().includes('deposit') && m.status === 'COMPLETED') || booking.paid > 0;
            const confirmedCompleted = booking.status === 'CONFIRMED';
            const eventDayCompleted = mList.some(m => m.label.toLowerCase().includes('execution') && m.status === 'COMPLETED') || (booking.status === 'CONFIRMED' && new Date(booking.date) < new Date());
            const isCancelled = booking.status === 'CANCELLED';

            const stages = [
              { label: 'Inquiry', isCompleted: true, isActive: !siteVisitCompleted && !isCancelled },
              { label: 'Site Visit', isCompleted: siteVisitCompleted, isActive: siteVisitCompleted ? false : (true && !designCompleted && !isCancelled) },
              { label: 'Quotation', isCompleted: designCompleted, isActive: designCompleted ? false : (siteVisitCompleted && !depositCompleted && !isCancelled) },
              { label: 'Advance Paid', isCompleted: depositCompleted, isActive: depositCompleted ? false : (designCompleted && !confirmedCompleted && !isCancelled) },
              { label: 'Confirmed', isCompleted: confirmedCompleted, isActive: confirmedCompleted ? false : (depositCompleted && !eventDayCompleted && !isCancelled) },
              { label: 'Completed', isCompleted: eventDayCompleted, isActive: eventDayCompleted ? false : (confirmedCompleted && !isCancelled) },
            ];

            return stages.map((stage, idx) => {
              const showCheck = stage.isCompleted && !isCancelled;
              const showPulse = stage.isActive && !isCancelled;
              
              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-2.5 z-10">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 ${
                    isCancelled
                      ? 'bg-red-500/10 border-red-500/30 text-red-500'
                      : stage.isCompleted
                      ? 'bg-gradient-to-br from-gold-600 to-gold-400 border-gold-400 text-zinc-950 font-extrabold'
                      : stage.isActive
                      ? 'bg-white dark:bg-zinc-900 border-gold-400 text-gold-500 animate-pulse'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-foreground/30'
                  }`}>
                    {isCancelled ? (
                      <X className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : showCheck ? (
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                      isCancelled
                        ? 'text-red-500/70'
                        : stage.isCompleted
                        ? 'text-foreground font-extrabold'
                        : stage.isActive
                        ? 'text-gold-600 dark:text-gold-400 font-extrabold'
                        : 'text-foreground/30'
                    }`}>
                      {stage.label}
                    </span>
                    <span className="block text-[8px] text-foreground/45">
                      {isCancelled 
                        ? 'Cancelled'
                        : stage.isCompleted
                        ? 'Completed'
                        : stage.isActive
                        ? 'Active Stage'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Milestones & Arrangements (Spans 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Milestone timeline card */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
              Booking Progress Timeline
            </h3>

            {/* Vertical timeline steps */}
            <div className="relative border-l border-gold-400/20 ml-3 pl-8 space-y-8">
              {booking.milestones.map((milestone, idx) => {
                const isCompleted = milestone.status === 'COMPLETED';
                const isInProgress = milestone.status === 'IN_PROGRESS';
                const isCancelled = milestone.status === 'CANCELLED';
                
                return (
                  <div key={idx} className="relative">
                    {/* Node Circle Indicator */}
                    <div className={`absolute -left-[45px] top-0.5 h-8 w-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-gold-600 to-gold-400 border-gold-400 text-zinc-950'
                        : isInProgress
                        ? 'bg-white dark:bg-zinc-900 border-gold-400 text-gold-500 animate-pulse'
                        : isCancelled
                        ? 'bg-red-500/10 border-red-500 text-red-500'
                        : 'bg-white dark:bg-zinc-900 border-gold-400/20 text-foreground/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                      ) : isCancelled ? (
                        <X className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                          isCompleted
                            ? 'text-foreground'
                            : isInProgress
                            ? 'text-gold-600 dark:text-gold-400'
                            : isCancelled
                            ? 'text-red-500'
                            : 'text-foreground/40'
                        }`}>
                          {milestone.label}
                        </h4>
                        
                        {milestone.date && (
                          <span className="text-[9px] text-foreground/40 font-medium">({milestone.date})</span>
                        )}
                        
                        {isInProgress && (
                          <span className="rounded-full bg-gold-400/10 border border-gold-400/20 px-2 py-0.2 text-[8px] font-bold tracking-wider text-gold-600 dark:text-gold-400 uppercase animate-pulse">
                            Active Stage
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-foreground/50 leading-relaxed max-w-md">
                        {isCompleted 
                          ? `Milestone successfully approved and cleared on ${milestone.date || 'schedule'}.` 
                          : isInProgress 
                          ? 'Catering coordinators and florists are aligning options for final customer selection.'
                          : isCancelled
                          ? 'Event has been marked cancelled. All stages terminated.'
                          : 'Pending previous milestone completion.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup Arrangement details */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
              Event Customization & Settings
            </h3>

            <div className="space-y-5 text-xs text-foreground/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-gold-400/5">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Catering Preference</span>
                  <span className="font-semibold text-foreground">Vegetarian / Non-Veg Premium International Fusion</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Package Selection</span>
                  <span className="font-semibold text-foreground">{booking.package}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-gold-400/5">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Guests Capacity Count</span>
                  <span className="font-semibold text-foreground">{booking.guests} Guests (Est.)</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Assigned Spot / Space</span>
                  <span className="font-semibold text-foreground">{booking.location}</span>
                </div>
              </div>

              <div>
                <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1.5">Coordinator Arrangements Notes</span>
                <p className="leading-relaxed text-[11px] text-foreground/60 bg-gold-400/5 p-4 rounded-xl border border-gold-400/10 italic">
                  &ldquo;{booking.notes}&rdquo;
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Invoices & Coordinator Panel */}
        <div className="space-y-8">
          
          {/* Coordinator Panel */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-sm space-y-5">
            <h4 className="font-serif text-lg font-bold text-foreground">Assigned Coordinator</h4>
            
            {booking.status !== 'CANCELLED' ? (
              <>
                <div className="flex items-center gap-4 pb-4 border-b border-gold-400/5">
                  <div className="h-11 w-11 rounded-xl bg-gold-400/10 text-gold-500 border border-gold-400/20 flex items-center justify-center font-serif font-bold text-lg">
                    {booking.coordinatorName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{booking.coordinatorName}</h5>
                    <p className="text-[10px] text-foreground/50">Senior Event Director</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-1">
                  <a 
                    href={`tel:${booking.coordinatorPhone}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gold-400/10 bg-gold-400/5 hover:bg-gold-400/10 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    <Phone className="h-4 w-4 text-gold-500" />
                    <span>{booking.coordinatorPhone}</span>
                  </a>
                  <a 
                    href={`https://wa.me/${booking.coordinatorPhone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gold-400/10 bg-gold-400/5 hover:bg-gold-400/10 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                    <span>WhatsApp Chat Coordinator</span>
                  </a>
                </div>
              </>
            ) : (
              <p className="text-xs text-foreground/50">No coordinator assigned to cancelled events.</p>
            )}
          </div>

          {/* Itemized invoice statement */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-sm space-y-5">
            <h4 className="font-serif text-lg font-bold text-foreground">Invoice Statement</h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-foreground/60 border-b border-gold-400/5 pb-2.5">
                <span>Standard Package Cost</span>
                <span className="font-semibold text-foreground">₹{Math.round(booking.cost * 0.85).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground/60 border-b border-gold-400/5 pb-2.5">
                <span>Setup & Floral Charges</span>
                <span className="font-semibold text-foreground">₹{Math.round(booking.cost * 0.10).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground/60 border-b border-gold-400/5 pb-2.5">
                <span>Service Fee & CGST (5%)</span>
                <span className="font-semibold text-foreground">₹{Math.round(booking.cost * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground border-b border-gold-400/15 pb-3 font-serif font-bold text-sm">
                <span>Total Amount Due</span>
                <span className="text-gold-600 dark:text-gold-400">₹{booking.cost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <span>Amount Paid</span>
                <span>₹{booking.paid.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-burgundy-600 dark:text-burgundy-400 font-bold">
                <span>Outstanding Balance</span>
                <span>₹{booking.pending.toLocaleString()}</span>
              </div>
            </div>

            {booking.pending > 0 && booking.status !== 'CANCELLED' && (
              <Link
                href={{
                  pathname: '/portal/payments',
                  query: { bookingId: booking.id, amount: booking.pending }
                }}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all cursor-pointer"
              >
                <span>Clear Balance</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

        </div>

      </div>

      {/* CANCELLATION MODAL */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 mb-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Cancel Booking Reservation?</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Are you sure you want to request cancellation for booking ID <span className="font-bold text-foreground font-mono">{booking.id}</span>? 
                  This will waive the outstanding balance and cancel all coordinator allocations. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-gold-400/25 px-4 py-3.5 font-sans text-xs font-bold tracking-wider text-foreground hover:bg-gold-400/5 transition-all cursor-pointer"
                >
                  Close / Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3.5 font-sans text-xs font-bold tracking-wider text-white shadow-md transition-colors cursor-pointer"
                >
                  Yes, Cancel Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditBookingModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        bookingId={booking.id} 
      />
    </div>
  );
}
