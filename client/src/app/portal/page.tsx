'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, CreditCard, Clock, CheckCircle2, AlertCircle, 
  Sparkles, ArrowRight, BookOpen, UserCheck, Bell 
} from 'lucide-react';
import { usePortal } from '../../lib/PortalContext';
import { useInquiry } from '../../lib/InquiryContext';

export default function CustomerDashboard() {
  const { user, bookings, payments, notifications } = usePortal();
  const { openInquiry } = useInquiry();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  // Find the primary active upcoming booking
  const upcomingBooking = bookings
    .filter(b => b.status !== 'CANCELLED' && new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Calculate stats dynamically
  const totalPaid = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.pending, 0);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update live countdown for the upcoming event date
  useEffect(() => {
    if (!upcomingBooking) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(upcomingBooking.date) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      setCountdown(timeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute

    return () => clearInterval(timer);
  }, [upcomingBooking]);

  if (!mounted) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get active step index based on milestones
  const getActiveStep = (milestones: any[]) => {
    const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
    return completedCount;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            Namaste, {user?.name || 'Valued Guest'}
          </h1>
          <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            Manage your banquet arrangements, verify receipts, and monitor progress
          </p>
        </div>
        
        {/* Dynamic status chip */}
        {upcomingBooking && (
          <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-gold-400/10 border border-gold-400/25 px-4.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Next Event: {upcomingBooking.date}
          </span>
        )}
      </div>

      {/* DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Upcoming Event */}
        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Upcoming Event</span>
              <div className="p-2 rounded-lg bg-gold-400/10 text-gold-500">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            {upcomingBooking ? (
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-foreground truncate">
                  {upcomingBooking.eventType}
                </h3>
                <p className="text-[10px] text-foreground/60 flex items-center gap-1">
                  <span>Location:</span>
                  <span className="font-semibold">{upcomingBooking.location}</span>
                </p>
                
                {/* Countdown display */}
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-gold-600 dark:text-gold-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{countdown.days}d {countdown.hours}h {countdown.minutes}m left</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground/50 py-2">No upcoming events booked.</p>
            )}
          </div>

          {upcomingBooking && (
            <Link 
              href={`/portal/bookings/${upcomingBooking.id}`}
              className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors self-start cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Card 2: Booking Status */}
        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Booking Status</span>
              <div className="p-2 rounded-lg bg-gold-400/10 text-gold-500">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </div>
            
            {upcomingBooking ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-foreground/50 font-medium">ID: {upcomingBooking.id}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                    upcomingBooking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {upcomingBooking.status}
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[9px] font-bold text-foreground/60">
                    <span>Progress Stage</span>
                    <span>{getActiveStep(upcomingBooking.milestones)}/6 Complete</span>
                  </div>
                  <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden flex gap-[2px]">
                    {[1, 2, 3, 4, 5, 6].map((step) => {
                      const completedCount = getActiveStep(upcomingBooking.milestones);
                      const isCompleted = step <= completedCount;
                      const isInProgress = step === completedCount + 1 && upcomingBooking.status !== 'CANCELLED';

                      return (
                        <div 
                          key={step} 
                          className={`h-full flex-1 rounded-sm transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-gold-600 to-gold-400' 
                              : isInProgress 
                              ? 'bg-gold-300/40 animate-pulse' 
                              : 'bg-gold-400/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground/50 py-2">No active reservations.</p>
            )}
          </div>

          {upcomingBooking && (
            <Link 
              href={`/portal/bookings/${upcomingBooking.id}`}
              className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors self-start cursor-pointer"
            >
              <span>Milestones checklist</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Card 3: Total Payments */}
        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Total Paid</span>
              <div className="p-2 rounded-lg bg-gold-400/10 text-gold-500">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                ₹{totalPaid.toLocaleString()}
              </h3>
              <p className="text-[10px] text-foreground/50">
                Total processed milestone payments
              </p>
            </div>
          </div>

          <Link 
            href="/portal/payments"
            className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 hover:text-gold-500 transition-colors self-start cursor-pointer"
          >
            <span>Payment History</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Outstanding Balance</span>
              <div className="p-2 rounded-lg bg-gold-400/10 text-gold-500">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-burgundy-600 dark:text-burgundy-400">
                ₹{totalPending.toLocaleString()}
              </h3>
              <p className="text-[10px] text-foreground/50">
                Remaining due balance on events
              </p>
            </div>
          </div>

          {totalPending > 0 ? (
            <Link 
              href="/portal/payments"
              className="mt-4 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-burgundy-600 dark:text-burgundy-400 hover:text-gold-500 transition-colors self-start cursor-pointer"
            >
              <span>Pay Balance Now</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Paid in Full
            </span>
          )}
        </div>

      </div>

      {/* DASHBOARD BOTTOM SECTION: QUICK ACTIONS & RECENT ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Deck */}
        <div className="lg:col-span-1 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
              Event Planner Tools
            </h3>
            <p className="text-xs text-foreground/60">Manage your event coordinate files and profiles</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {/* Action 1: Book another event */}
            <button
              onClick={() => openInquiry()}
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5 hover:bg-gold-400/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-gold-400/10 text-gold-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Book New Banquet</h4>
                <p className="text-[10px] text-foreground/50 mt-0.5">Inquire packages & check calendar slot</p>
              </div>
            </button>

            {/* Action 2: Profile settings */}
            <Link
              href="/portal/profile"
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5 hover:bg-gold-400/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-gold-400/10 text-gold-500">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Edit Arrangements Prefs</h4>
                <p className="text-[10px] text-foreground/50 mt-0.5">Update billing, catering, & decor style</p>
              </div>
            </Link>

            {/* Action 3: Invoices */}
            <Link
              href="/portal/payments"
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5 hover:bg-gold-400/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-gold-400/10 text-gold-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Milestone Receipts</h4>
                <p className="text-[10px] text-foreground/50 mt-0.5">Download print receipts & statements</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Notifications / Alerts */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
                Recent Notifications
              </h3>
              <p className="text-xs text-foreground/60">Important timeline alerts from venue organizers</p>
            </div>
            
            <Link 
              href="/portal/notifications"
              className="text-[10px] font-bold uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All</span>
              <Bell className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {notifications.slice(0, 3).map((ntf) => (
              <div 
                key={ntf.id} 
                className={`p-4.5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                  ntf.read 
                    ? 'border-gold-400/10 bg-white/20 dark:bg-zinc-900/20 opacity-75' 
                    : 'border-gold-400/20 bg-white dark:bg-zinc-900 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  ntf.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : ntf.type === 'warning' 
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' 
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                }`}>
                  {ntf.type === 'success' ? (
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  ) : ntf.type === 'warning' ? (
                    <AlertCircle className="h-4.5 w-4.5" />
                  ) : (
                    <Bell className="h-4.5 w-4.5" />
                  )}
                </div>
                
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs font-bold text-foreground ${!ntf.read && 'text-gold-600 dark:text-gold-400'}`}>
                      {ntf.title}
                    </h4>
                    <span className="text-[9px] text-foreground/40 font-medium whitespace-nowrap">{ntf.date}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground/70">{ntf.message}</p>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="py-12 text-center text-xs text-foreground/40">
                You have no active notifications at the moment.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
