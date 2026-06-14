'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, AlertCircle, TrendingUp, LogOut, Trash2, 
  Download, Search, Sparkles, Filter, Check, Clock, X 
} from 'lucide-react';
import { Booking, getBookings, updateBookingStatus, deleteBooking } from '../../utils/storage';

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Route security gate check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('admin_auth');
      if (auth !== 'true') {
        router.push('/login');
      } else {
        setIsMounted(true);
        setBookings(getBookings());
      }
    }
  }, [router]);

  if (!isMounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-sans tracking-widest text-gold-500 uppercase">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Action handlers
  const handleStatusChange = (id: string, status: Booking['status']) => {
    const updated = updateBookingStatus(id, status);
    setBookings(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking inquiry?')) {
      const updated = deleteBooking(id);
      setBookings(updated);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('admin_auth');
    router.push('/login');
  };

  // CSV Export utility
  const exportToCSV = () => {
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

  // Filters
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.cost, 0);

  // Category chart distribution calculations
  const categories = Array.from(new Set(bookings.map(b => b.eventType)));
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: bookings.filter(b => b.eventType === cat).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-ivory-50 dark:bg-zinc-950 min-h-[90vh]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Top Navigation bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-gold-500" />
              Manage inquiries, schedule bookings, and track statistics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl border border-gold-400/20 bg-white dark:bg-zinc-900 px-4 py-2.5 font-sans text-xs font-bold tracking-wider text-foreground hover:border-gold-400 hover:text-gold-400 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 px-4 py-2.5 font-sans text-xs font-bold tracking-wider text-white uppercase shadow-md"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Inquiries', val: totalCount, desc: 'All incoming event requests', icon: Users, color: 'text-blue-500' },
            { label: 'Pending Reviews', val: pendingCount, desc: 'Needs response within 2h', icon: Clock, color: 'text-amber-500' },
            { label: 'Confirmed Events', val: confirmedCount, desc: 'Locked on event calendar', icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Confirmed Revenue', val: `₹${totalRevenue.toLocaleString()}`, desc: 'Total from confirmed slots', icon: TrendingUp, color: 'text-gold-500' },
          ].map((card, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 flex items-start gap-4">
              <div className={`p-3.5 rounded-xl bg-gold-400/10 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">{card.label}</span>
                <h3 className="font-serif text-2xl font-bold text-foreground">{card.val}</h3>
                <p className="text-[10px] text-foreground/50">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mid Grid: Analytics chart & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Visual Category chart Panel */}
          <div className="lg:col-span-1 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground mb-4">Event Types Distribution</h3>
              <p className="text-xs text-foreground/60 mb-6">Popularity based on customer requests</p>
              
              <div className="space-y-5">
                {categoryCounts.map((cat, idx) => {
                  const percent = totalCount > 0 ? (cat.count / totalCount) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-foreground/80">
                        <span>{cat.name}</span>
                        <span>{cat.count} inquiries ({Math.round(percent)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
                {totalCount === 0 && (
                  <p className="text-xs text-foreground/40 text-center py-12">No data available</p>
                )}
              </div>
            </div>
            
            <div className="pt-6 border-t border-gold-400/10 mt-6 text-[10px] text-foreground/50 leading-relaxed">
              *Graph automatically re-renders as client-side localStorage inquiries are added in real-time.
            </div>
          </div>

          {/* Bookings Table Panel */}
          <div className="lg:col-span-2 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md space-y-6">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Booking Inquiries</h3>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:flex-initial">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone..."
                    className="w-full sm:w-48 rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-8 pr-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                  />
                </div>

                {/* Filter Status Selector */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gold-400/15 bg-gold-400/5 font-serif text-[11px] font-bold text-foreground">
                    <th className="p-3">Client</th>
                    <th className="p-3">Event Date</th>
                    <th className="p-3">Package Details</th>
                    <th className="p-3">Est. Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  <AnimatePresence mode="popLayout">
                    {filteredBookings.map((booking) => (
                      <motion.tr
                        key={booking.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gold-400/5 transition-colors"
                      >
                        {/* Client details */}
                        <td className="p-3">
                          <span className="block font-bold text-foreground">{booking.name}</span>
                          <span className="block text-[10px] text-foreground/50">{booking.phone}</span>
                          <span className="block text-[9px] text-foreground/40">{booking.email}</span>
                        </td>
                        
                        {/* Event Category & Date */}
                        <td className="p-3 font-medium">
                          <span className="block font-semibold text-foreground">{booking.eventType}</span>
                          <span className="block text-[10px] text-foreground/50">{booking.date}</span>
                        </td>

                        {/* Package Details */}
                        <td className="p-3">
                          <span className="block font-medium text-foreground">{booking.package}</span>
                          <span className="block text-[10px] text-foreground/50">{booking.guests} Guests</span>
                        </td>

                        {/* Cost */}
                        <td className="p-3 font-bold text-gold-500">
                          ₹{booking.cost.toLocaleString()}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {booking.status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {/* Toggle buttons */}
                            {booking.status !== 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                                className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                title="Confirm Booking"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {booking.status !== 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'PENDING')}
                                className="p-1 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
                                title="Set Pending"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {booking.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                className="p-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                                title="Cancel Booking"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="p-1 rounded border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-1"
                              title="Delete Request"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-foreground/40">
                        No inquiries matches search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
