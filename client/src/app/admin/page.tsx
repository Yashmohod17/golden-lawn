'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, AlertCircle, TrendingUp, Download, Search, 
  Sparkles, Filter, Check, Clock, X, Calendar, Bell, Shield, ArrowRight, CreditCard
} from 'lucide-react';
import { useAdmin } from '../../lib/AdminContext';
import { adminService, DashboardSummary } from '../../services/admin';
import { Booking, updateBookingStatus, deleteBooking } from '../../services/booking';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { adminUser, hasPermission } = useAdmin();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      const sumData = await adminService.getSummary();
      setSummary(sumData);
      
      // Load general bookings for the search table
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const bookingsData = await response.json();
        setBookings(bookingsData);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setError(err.message || 'Failed to sync dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaryData();
  }, []);

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status);
      await loadSummaryData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking inquiry?')) {
      try {
        await deleteBooking(id);
        await loadSummaryData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete booking');
      }
    }
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (!bookings.length) return;
    const headers = 'ID,Name,Email,Phone,Event Type,Date,Guests,Package,Cost (INR),Status,Created At\n';
    const rows = bookings.map(b => 
      `"${b.id}","${b.name}","${b.email}","${b.phone}","${b.eventType}","${b.date}",${b.guests},"${b.package}",${b.cost},"${b.status}","${b.createdAt}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `golden_lawn_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Syncing stats summary...</p>
        </div>
      </div>
    );
  }

  const upcoming = summary?.upcomingEvents || [];
  const recentNotifs = summary?.recentNotifications || [];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            Welcome, {adminUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            Lawn Management Overview: Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl border border-gold-400/20 bg-white dark:bg-zinc-900 px-4 py-2.5 font-sans text-xs font-bold tracking-wider text-foreground hover:border-gold-400 hover:text-gold-400 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Bookings CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 text-xs text-red-500 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inquiries', val: summary?.totalBookings || 0, desc: 'All incoming event requests', icon: Users, color: 'text-blue-500' },
          { label: 'Lawn Occupancy', val: `${summary?.occupancyRate || 0}%`, desc: 'Booked in next 30 days', icon: Calendar, color: 'text-amber-500' },
          { label: 'Monthly Revenue', val: `₹${(summary?.monthlyRevenue || 0).toLocaleString('en-IN')}`, desc: 'Earned this calendar month', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Pending Receivables', val: `₹${(summary?.pendingPayments || 0).toLocaleString('en-IN')}`, desc: 'Total outstanding balances', icon: CreditCard, color: 'text-gold-500' },
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 flex items-start gap-4 bg-white dark:bg-zinc-900 border border-gold-400/10 shadow-sm">
            <div className={`p-3 rounded-xl bg-gold-400/10 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">{card.label}</span>
              <h3 className="font-serif text-2xl font-bold text-foreground">{card.val}</h3>
              <p className="text-[10px] text-foreground/50">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Upcoming and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Events */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md bg-white dark:bg-zinc-900 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Upcoming Lawn Events</h3>
              <p className="text-[10px] text-foreground/50">Next scheduled events on the property</p>
            </div>
            <Link 
              href="/admin/bookings" 
              className="text-[11px] font-bold text-gold-500 hover:text-gold-600 flex items-center gap-1 uppercase tracking-wider transition-colors"
            >
              All Bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcoming.map((b: any) => (
              <div 
                key={b.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-gold-400/5 border border-gold-400/10 hover:border-gold-400/30 transition-all gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{b.name}</span>
                    <span className="text-[10px] text-foreground/40 font-mono">({b.id})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                    <span className="font-semibold text-gold-600 dark:text-gold-400">{b.eventType}</span>
                    <span>•</span>
                    <span>{b.date}</span>
                    <span>•</span>
                    <span>{b.guests} Guests</span>
                  </div>
                  <p className="text-[11px] text-foreground/50 truncate max-w-md italic">{b.package}</p>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-gold-500">₹{b.cost.toLocaleString('en-IN')}</span>
                    <span className="block text-[9px] uppercase tracking-wider text-foreground/40">Cost Est.</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    b.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : b.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gold-400/20 rounded-xl text-foreground/50">
                <Calendar className="h-8 w-8 text-gold-400/30 mx-auto mb-2" />
                <p className="text-xs uppercase tracking-wider">No upcoming events scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity & Logs */}
        <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md bg-white dark:bg-zinc-900 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Recent In-App Activity</h3>
              <p className="text-[10px] text-foreground/50">Recent notifications and bookings logs</p>
            </div>

            <div className="space-y-4">
              {recentNotifs.map((n: any) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-ivory-50/50 dark:bg-zinc-900 border border-gold-400/5 hover:border-gold-400/10 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-xs font-bold text-foreground line-clamp-1">{n.title}</span>
                    <span className="text-[9px] text-foreground/40 shrink-0 font-mono">{n.date}</span>
                  </div>
                  <p className="text-[10px] text-foreground/60 leading-relaxed">{n.message}</p>
                </div>
              ))}

              {recentNotifs.length === 0 && (
                <div className="text-center py-12 text-foreground/40">
                  <Bell className="h-8 w-8 text-gold-400/30 mx-auto mb-2" />
                  <p className="text-xs uppercase tracking-wider">No recent notifications</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-gold-400/10 mt-6 text-[9px] text-foreground/50 leading-relaxed flex items-center justify-between">
            <span>Audit status: SECURE</span>
            <span className="font-bold flex items-center gap-1"><Shield className="h-3 w-3 text-gold-500" /> SYSTEM ONLINE</span>
          </div>
        </div>

      </div>
    </div>
  );
}
