'use client';

import React, { useState, useEffect } from 'react';
import { CustomDialog } from './ui/CustomDialog';
import { IndianRupee, Save, Settings, Sparkles } from 'lucide-react';
import { usePortal } from '../lib/PortalContext';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export function EditBookingModal({ isOpen, onClose, bookingId }: EditBookingModalProps) {
  const { bookings, updateBooking } = usePortal();
  const booking = bookings.find((b) => b.id === bookingId);

  // Form states
  const [eventType, setEventType] = useState('Wedding');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('300');
  const [pkg, setPkg] = useState('GOLD PACKAGE');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);
  const [status, setStatus] = useState('PENDING');

  // Milestone check states for demo testing
  const [inquiryMilestone, setInquiryMilestone] = useState(true);
  const [siteVisitMilestone, setSiteVisitMilestone] = useState(false);
  const [depositMilestone, setDepositMilestone] = useState(false);
  const [designMilestone, setDesignMilestone] = useState(false);
  const [balanceMilestone, setBalanceMilestone] = useState(false);
  const [eventDayMilestone, setEventDayMilestone] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoControls, setShowDemoControls] = useState(false);

  // Load booking values on open
  useEffect(() => {
    if (isOpen && booking) {
      setEventType(booking.eventType);
      setDate(booking.date);
      setGuests(String(booking.guests));
      setPkg(booking.package);
      setNotes(booking.notes || '');
      setCost(booking.cost);
      setStatus(booking.status);

      // Milestones mapping
      const mList = booking.milestones || [];
      setInquiryMilestone(mList.some((m) => m.label.toLowerCase().includes('inquiry') && m.status === 'COMPLETED'));
      setSiteVisitMilestone(mList.some((m) => m.label.toLowerCase().includes('site visit') && m.status === 'COMPLETED'));
      setDepositMilestone(
        mList.some((m) => m.label.toLowerCase().includes('deposit') && m.status === 'COMPLETED') ||
        booking.paid > 0
      );
      setDesignMilestone(mList.some((m) => m.label.toLowerCase().includes('design') && m.status === 'COMPLETED'));
      setBalanceMilestone(
        mList.some((m) => m.label.toLowerCase().includes('balance') && m.status === 'COMPLETED') ||
        booking.pending === 0
      );
      setEventDayMilestone(mList.some((m) => m.label.toLowerCase().includes('execution') && m.status === 'COMPLETED'));
    }
  }, [isOpen, bookingId, booking]);

  const recalculateCost = (p: string, eType: string, gCountStr: string) => {
    const pVal = p.toLowerCase();
    const baseRate = pVal.includes('silver') ? 1200 : pVal.includes('platinum') ? 4500 : 2500;
    const eTypeLower = eType.toLowerCase();
    const multiplier = eTypeLower.includes('wedding') ? 1.2 : eTypeLower.includes('corporate') ? 1.15 : eTypeLower.includes('birthday') ? 0.8 : 1.0;
    const guestVal = parseInt(gCountStr) || 100;
    setCost(Math.round(baseRate * guestVal * multiplier));
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!date) tempErrors.date = 'Booking Date is required';
    const guestCount = parseInt(guests);
    if (isNaN(guestCount) || guestCount < 100) {
      tempErrors.guests = 'Guest count must be at least 100';
    }

    // Downgrade prevention checks
    if (booking && cost < booking.cost) {
      if (booking.paid >= booking.cost) {
        tempErrors.package = 'Package downgrade is not allowed for fully settled bookings.';
      } else if (booking.paid >= cost) {
        tempErrors.package = `Package downgrade is not allowed because the amount already paid (₹${booking.paid.toLocaleString()}) is greater than or equal to the new package cost (₹${cost.toLocaleString()}).`;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!booking) return;

    setIsSubmitting(true);

    try {
      const guestVal = parseInt(guests) || 100;
      
      let paidVal = booking.paid;
      let balanceMilestoneStatus = balanceMilestone;

      // Handle package tier or guests changes that alter the estimate
      if (cost !== booking.cost) {
        if (cost > paidVal) {
          // If the cost increased above the previously paid amount, they are no longer fully paid.
          balanceMilestoneStatus = false;
        } else {
          // If the cost fell below or equals what they paid, it remains fully paid.
          balanceMilestoneStatus = true;
          paidVal = cost;
        }
      } else if (showDemoControls) {
        // Apply default simulation updates ONLY when developer demo controls are active
        if (depositMilestone && paidVal === 0) {
          paidVal = Math.round(cost * 0.45); // 45% deposit paid
        } else if (!depositMilestone) {
          paidVal = 0;
        }
        if (balanceMilestone) {
          paidVal = cost; // fully paid
        }
      }

      // Update milestones structure based on dynamic status
      const updatedMilestones = [
        { id: 'm1', label: 'Inquiry Submitted', date: booking.date, status: inquiryMilestone ? 'COMPLETED' : 'PENDING' },
        { id: 'm2', label: 'Site Visit & Consultation', date: siteVisitMilestone ? new Date().toISOString().split('T')[0] : null, status: siteVisitMilestone ? 'COMPLETED' : 'PENDING' },
        { id: 'm3', label: 'Booking Deposit Paid', date: depositMilestone ? new Date().toISOString().split('T')[0] : null, status: depositMilestone ? 'COMPLETED' : 'PENDING' },
        { id: 'm4', label: 'Design & Menu Finalization', date: designMilestone ? new Date().toISOString().split('T')[0] : null, status: designMilestone ? 'COMPLETED' : 'PENDING' },
        { id: 'm5', label: 'Balance Settlement', date: balanceMilestoneStatus ? new Date().toISOString().split('T')[0] : null, status: balanceMilestoneStatus ? 'COMPLETED' : 'PENDING' },
        { id: 'm6', label: 'Event Execution Day', date: eventDayMilestone ? new Date().toISOString().split('T')[0] : null, status: eventDayMilestone ? 'COMPLETED' : 'PENDING' },
      ];

      const updatedFields = {
        eventType,
        date,
        guests: guestVal,
        package: pkg,
        cost,
        paid: paidVal,
        notes,
        status: status as any,
        milestones: updatedMilestones as any,
      };

      await updateBooking(booking.id, updatedFields);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Reservation Details"
      description={`Update event configurations for Booking ID: ${booking.id}`}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Event Type & Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => {
                const val = e.target.value;
                setEventType(val);
                recalculateCost(pkg, val, guests);
              }}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
            >
              <option value="Wedding">Wedding</option>
              <option value="Reception">Reception</option>
              <option value="Engagement">Engagement</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Cultural Function">Cultural Function</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Estimated Guest Count
            </label>
            <input
              type="number"
              value={guests}
              onChange={(e) => {
                const val = e.target.value;
                setGuests(val);
                recalculateCost(pkg, eventType, val);
              }}
              min="100"
              max="2000"
              className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                errors.guests ? 'border-red-500' : 'border-gold-400/15'
              }`}
            />
            {errors.guests && <p className="mt-1 text-[10px] text-red-500">{errors.guests}</p>}
          </div>
        </div>

        {/* Row 2: Date & Package Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                errors.date ? 'border-red-500' : 'border-gold-400/15'
              }`}
            />
            {errors.date && <p className="mt-1 text-[10px] text-red-500">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Package Tier
            </label>
            <select
              value={pkg}
              onChange={(e) => {
                const val = e.target.value;
                setPkg(val);
                recalculateCost(val, eventType, guests);
              }}
              className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                errors.package ? 'border-red-500' : 'border-gold-400/15'
              }`}
            >
              <option value="SILVER PACKAGE">Silver Package</option>
              <option value="GOLD PACKAGE">Gold Package</option>
              <option value="PLATINUM PACKAGE">Platinum Package</option>
            </select>
            {errors.package && <p className="mt-1 text-[10px] text-red-500">{errors.package}</p>}
          </div>
        </div>

        {/* Special Decoration Notes */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
            Special Decoration Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 resize-none"
          />
        </div>

        {/* DEMO / STATUS DEVELOPER CONTROLS TOGGLE */}
        <div className="border-t border-gold-400/10 pt-4">
          <button
            type="button"
            onClick={() => setShowDemoControls(!showDemoControls)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 hover:text-gold-500 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{showDemoControls ? 'Hide Demo Status Controls' : 'Show Demo Status Controls'}</span>
          </button>

          {showDemoControls && (
            <div className="mt-4 p-4 rounded-2xl bg-gold-400/5 border border-gold-400/10 space-y-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gold-600 uppercase">
                <Sparkles className="h-3 w-3" />
                <span>Simulation Settings</span>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">
                  Timeline Active Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                >
                  <option value="PENDING">Inquiry Phase (PENDING)</option>
                  <option value="CONFIRMED">Approved (CONFIRMED)</option>
                  <option value="CANCELLED">Terminated (CANCELLED)</option>
                </select>
              </div>

              {/* Milestone Checkboxes */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-2">
                  Complete Milestones
                </label>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-foreground/75 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inquiryMilestone}
                      onChange={(e) => setInquiryMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>1. Inquiry Submitted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteVisitMilestone}
                      onChange={(e) => setSiteVisitMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>2. Site Visit & Consultation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={depositMilestone}
                      onChange={(e) => setDepositMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>3. Booking Deposit Paid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={designMilestone}
                      onChange={(e) => setDesignMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>4. Design & Menu Finalization</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={balanceMilestone}
                      onChange={(e) => setBalanceMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>5. Balance Settlement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventDayMilestone}
                      onChange={(e) => setEventDayMilestone(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span>6. Event Execution Day</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cost & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gold-400/15 pt-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
              <IndianRupee className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-foreground/50">Recalculated Estimate</p>
              <p className="font-serif text-lg font-bold text-gold-500">₹{cost.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-gold-400/25 px-5 py-3.5 font-sans text-xs font-bold tracking-wider text-foreground hover:bg-gold-400/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </CustomDialog>
  );
}
