'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Edit, Trash2, Calendar, User, Eye, Check, Clock, X, 
  MapPin, AlertCircle, Plus, FileText, IndianRupee, Save, Sparkles, UserCheck 
} from 'lucide-react';
import { Booking, getBookings, updateBookingStatus, deleteBooking } from '../../../services/booking';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Inspector drawer details
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBookingId, setEditBookingId] = useState('');
  const [editEventType, setEditEventType] = useState('Wedding');
  const [editDate, setEditDate] = useState('');
  const [editGuests, setEditGuests] = useState(300);
  const [editPkg, setEditPkg] = useState('GOLD PACKAGE');
  const [editCost, setEditCost] = useState(0);
  const [editPaid, setEditPaid] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editCoordinatorName, setEditCoordinatorName] = useState('');
  const [editCoordinatorPhone, setEditCoordinatorPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editErrors, setEditErrors] = useState<string>('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleInspect = async (booking: Booking) => {
    setSelectedBooking(booking);
    setLoadingTimeline(true);
    try {
      const tRes = await fetch(`/api/bookings/${booking.id}/timeline`);
      const hRes = await fetch(`/api/bookings/${booking.id}/status-history`);
      if (tRes.ok && hRes.ok) {
        setTimelineEvents(await tRes.json());
        setHistoryEvents(await hRes.json());
      }
    } catch (err) {
      console.error('Failed to load timeline/history logs:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === id) {
        const updatedB = bookings.find(b => b.id === id);
        if (updatedB) {
          handleInspect({ ...updatedB, status });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reservation inquiry? This is destructive.')) return;
    try {
      await deleteBooking(id);
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete booking');
    }
  };

  const openEditModal = (b: any) => {
    setEditBookingId(b.id);
    setEditEventType(b.eventType);
    setEditDate(b.date);
    setEditGuests(b.guests);
    setEditPkg(b.package);
    setEditCost(b.cost);
    setEditPaid(b.paid);
    setEditNotes(b.notes || '');
    setEditCoordinatorName(b.coordinatorName || 'Aravind Sharma');
    setEditCoordinatorPhone(b.coordinatorPhone || '+91 98877 66554');
    setEditLocation(b.location || 'Grand Main Lawn A & B');
    setEditStatus(b.status);
    setEditErrors('');
    setIsEditOpen(true);
  };

  const recalculateCost = (p: string, eType: string, gCount: number) => {
    const pVal = p.toLowerCase();
    const baseRate = pVal.includes('silver') ? 1200 : pVal.includes('platinum') ? 4500 : 2500;
    const eTypeLower = eType.toLowerCase();
    const multiplier = eTypeLower.includes('wedding') ? 1.2 : eTypeLower.includes('corporate') ? 1.15 : eTypeLower.includes('birthday') ? 0.8 : 1.0;
    setEditCost(Math.round(baseRate * gCount * multiplier));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrors('');

    // Downgrade protection validations
    const originalBooking = bookings.find(b => b.id === editBookingId);
    if (originalBooking) {
      const originalPaid = originalBooking.paid || 0;
      if (editCost < originalBooking.cost) {
        if (originalPaid >= originalBooking.cost) {
          setEditErrors('Package downgrade is not allowed for fully settled bookings.');
          return;
        } else if (originalPaid >= editCost) {
          setEditErrors(`Package downgrade is not allowed because the amount already paid (₹${originalPaid.toLocaleString()}) is greater than or equal to the new package cost (₹${editCost.toLocaleString()}).`);
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem('admin_access_token');
      const res = await fetch(`/api/bookings/${editBookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventType: editEventType,
          date: editDate,
          guests: editGuests,
          package: editPkg,
          cost: editCost,
          paid: editPaid,
          notes: editNotes,
          coordinatorName: editCoordinatorName,
          coordinatorPhone: editCoordinatorPhone,
          location: editLocation,
          status: editStatus
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update reservation');
      }

      setIsEditOpen(false);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === editBookingId) {
        const refreshed = await res.json();
        setSelectedBooking(refreshed);
      }
    } catch (err: any) {
      setEditErrors(err.message || 'An error occurred while saving.');
    }
  };

  // Filters
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Reservations Directory</h2>
          <p className="text-xs text-foreground/50">Manage booking dates, update guest sizes, packages pricing, and review status logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gold-400/10 shadow-sm justify-between">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client name, reservation ID..."
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 text-[10px] font-bold tracking-wider uppercase rounded-xl border transition-all cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-gold-500 text-zinc-950 border-gold-500' 
                      : 'border-gold-400/10 text-foreground/70 bg-ivory-50/20 hover:border-gold-400/35'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-foreground/50">
                <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading lawns bookings schedule...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">ID / Client</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Package details</th>
                      <th className="p-4">Total / Paid</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {filteredBookings.map((b) => (
                      <tr 
                        key={b.id} 
                        className={`hover:bg-gold-400/5 transition-colors cursor-pointer ${selectedBooking?.id === b.id ? 'bg-gold-400/10' : ''}`}
                        onClick={() => handleInspect(b)}
                      >
                        <td className="p-4">
                          <span className="font-mono text-[10px] block text-foreground/45">#{b.id}</span>
                          <span className="font-bold text-foreground block">{b.name}</span>
                          <span className="text-[10px] text-foreground/50 block">{b.phone}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold block text-foreground">{b.eventType}</span>
                          <span className="text-foreground/50 text-[10px] block">{b.date}</span>
                        </td>
                        <td className="p-4">
                          <span className="block font-medium">{b.package}</span>
                          <span className="text-[10px] text-foreground/50 block">{b.guests} guests</span>
                        </td>
                        <td className="p-4 font-semibold">
                          <span className="block text-gold-600 dark:text-gold-400 font-bold">₹{b.cost.toLocaleString('en-IN')}</span>
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">Paid: ₹{(b.paid || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : b.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => openEditModal(b)}
                              className="p-1 rounded bg-gold-400/10 text-gold-500 hover:bg-gold-500 hover:text-zinc-950 transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(b.id)}
                              className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-foreground/40">
                          No reservation logs match search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Details Drawer */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedBooking ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel border border-gold-400/20 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 sticky top-24 max-h-[78vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Reservation Inspector</h3>
                    <p className="font-mono text-[9px] text-foreground/40">#{selectedBooking.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="p-1.5 rounded-lg text-foreground/50 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-[1px] bg-gold-400/10" />

                {/* Logistics */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Client Name:</span>
                    <span className="font-bold">{selectedBooking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Location:</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gold-500 shrink-0" />
                      {selectedBooking.location || 'Main Lawn'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Coordinator:</span>
                    <span className="font-medium text-foreground">{selectedBooking.coordinatorName || 'Not Assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Status:</span>
                    <span className={`font-bold rounded-full px-2 py-0.5 text-[9px] uppercase ${
                      selectedBooking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedBooking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Box */}
                <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/10 space-y-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60">Quick Adjust Status</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'PENDING')}
                      className={`py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                        selectedBooking.status === 'PENDING' ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'border-gold-400/10 text-foreground/60 hover:border-gold-400/30'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'CONFIRMED')}
                      className={`py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                        selectedBooking.status === 'CONFIRMED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gold-400/10 text-foreground/60 hover:border-gold-400/30'
                      }`}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')}
                      className={`py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                        selectedBooking.status === 'CANCELLED' ? 'bg-red-500 border-red-500 text-white' : 'border-gold-400/10 text-foreground/60 hover:border-gold-400/30'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Status History & Changes Timeline */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold-500" />
                    Timeline Audit Logs
                  </h4>
                  
                  {loadingTimeline ? (
                    <div className="text-center py-6 text-foreground/40 text-[10px]">Syncing timeline...</div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {timelineEvents.map((t: any) => (
                        <div key={t.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-gold-400/5 relative pl-4 border-l-2 border-l-gold-400">
                          <span className="block text-[9px] text-foreground/45 font-mono mb-1">{t.date} ({t.type})</span>
                          <span className="font-bold block text-foreground mb-0.5">{t.title}</span>
                          <p className="text-[10px] text-foreground/60 leading-relaxed">{t.description}</p>
                        </div>
                      ))}
                      {timelineEvents.length === 0 && (
                        <p className="text-[10px] text-center text-foreground/40 py-2">No timeline updates recorded.</p>
                      )}
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/40 flex flex-col justify-center items-center h-[50vh]">
                <Eye className="h-10 w-10 text-gold-400/30 mb-3" />
                <h4 className="font-serif font-bold text-foreground/70 mb-1">Reservation Inspector</h4>
                <p className="text-[10px] max-w-[200px]">Click any reservation card in the table to display complete status history, audit logs, and coordinator mappings.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3.5 mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Edit Reservation Configurations</h3>
                  <p className="text-[10px] text-foreground/40 font-mono">ID: #{editBookingId}</p>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 rounded-lg text-foreground/50 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {editErrors && (
                <div className="mb-4 flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{editErrors}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                
                {/* Event Type & Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Event Type</label>
                    <select
                      value={editEventType}
                      onChange={(e) => {
                        setEditEventType(e.target.value);
                        recalculateCost(editPkg, e.target.value, editGuests);
                      }}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Anniversary">Anniversary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Guests Count</label>
                    <input
                      type="number"
                      value={editGuests}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditGuests(val);
                        recalculateCost(editPkg, editEventType, val);
                      }}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                      min="100"
                    />
                  </div>
                </div>

                {/* Package & Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Package Tier</label>
                    <select
                      value={editPkg}
                      onChange={(e) => {
                        setEditPkg(e.target.value);
                        recalculateCost(e.target.value, editEventType, editGuests);
                      }}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    >
                      <option value="SILVER PACKAGE">Silver Package</option>
                      <option value="GOLD PACKAGE">Gold Package</option>
                      <option value="PLATINUM PACKAGE">Platinum Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Lawn Reservation Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                {/* Cost override & Paid amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Calculated Cost (₹)</label>
                    <input
                      type="number"
                      value={editCost}
                      onChange={(e) => setEditCost(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Settled Amount (₹)</label>
                    <input
                      type="number"
                      value={editPaid}
                      onChange={(e) => setEditPaid(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Location & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Property Location</label>
                    <select
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    >
                      <option value="Grand Main Lawn A & B">Grand Main Lawn A & B</option>
                      <option value="Cozy Mini Lawn B">Cozy Mini Lawn B</option>
                      <option value="Riverside Banquet Deck">Riverside Banquet Deck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Coordinator details */}
                <div className="grid grid-cols-2 gap-4 font-semibold">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Coordinator Name</label>
                    <input
                      type="text"
                      value={editCoordinatorName}
                      onChange={(e) => setEditCoordinatorName(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Coordinator Phone</label>
                    <input
                      type="text"
                      value={editCoordinatorPhone}
                      onChange={(e) => setEditCoordinatorPhone(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                {/* Decoration Notes */}
                <div>
                  <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Event Remarks & Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
