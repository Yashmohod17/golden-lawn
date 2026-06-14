'use client';

import React, { useState, useEffect } from 'react';
import { useInquiry } from '../context/InquiryContext';
import { CustomDialog } from './ui/CustomDialog';
import { Sparkles, Calendar, Users, IndianRupee, Send, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addBooking } from '../utils/storage';

export function InquiryModal() {
  const { isOpen, closeInquiry, selectedPackage, selectedDate, estimatedCost } = useInquiry();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('300');
  const [pkg, setPkg] = useState('gold');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state when context values change
  useEffect(() => {
    if (isOpen) {
      if (selectedPackage) {
        const pVal = selectedPackage.toLowerCase().includes('silver')
          ? 'silver'
          : selectedPackage.toLowerCase().includes('platinum')
          ? 'platinum'
          : 'gold';
        setPkg(pVal);
      }
      if (selectedDate) {
        setDate(selectedDate);
      }
      if (estimatedCost) {
        setCost(estimatedCost);
      }
    }
  }, [isOpen, selectedPackage, selectedDate, estimatedCost]);

  // Recalculate estimated cost inside modal dynamically if selections change
  useEffect(() => {
    let baseRate = pkg === 'silver' ? 1200 : pkg === 'platinum' ? 4500 : 2500;
    let multiplier = eventType === 'wedding' ? 1.2 : eventType === 'corporate' ? 1.15 : eventType === 'birthday' ? 0.8 : 1.0;
    let guestVal = parseInt(guests) || 100;
    setCost(Math.round(baseRate * guestVal * multiplier));
  }, [pkg, eventType, guests]);

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?([0-9]{2})?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$/.test(phone.replace(/\s+/g, ''))) {
      // Basic 10-digit check
      if (phone.replace(/\D/g, '').length < 10) {
        tempErrors.phone = 'Enter a valid 10-digit phone number';
      }
    }
    if (!date) tempErrors.date = 'Please pick a booking date';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        email,
        phone,
        eventType,
        date,
        guests: parseInt(guests) || 100,
        pkg: pkg.toUpperCase() + ' PACKAGE',
        cost,
        notes,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Sync to client database
        addBooking({
          name,
          email,
          phone,
          eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1),
          date,
          guests: parseInt(guests) || 100,
          package: pkg.toUpperCase() + ' PACKAGE',
          cost,
          notes,
        });

        setIsSuccess(true);
        // Play Confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#9E1F42', '#FFFFFF'],
        });
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset Form
    setIsSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setErrors({});
    closeInquiry();
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? 'Booking Confirmed!' : 'Plan Your Celebration'}
      description={isSuccess ? 'Your golden celebration has been scheduled' : 'Please provide details about your dream event'}
      className="max-w-xl"
    >
      {isSuccess ? (
        /* Success Screen */
        <div className="text-center py-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-xl font-semibold text-foreground">
              Thank You, {name}!
            </h4>
            <p className="text-sm text-foreground/70 dark:text-foreground/60 leading-relaxed max-w-sm mx-auto">
              We have received your inquiry for a <strong className="text-gold-500">{eventType.toUpperCase()}</strong> on <strong>{date}</strong>. A venue coordinator will contact you at <strong>{phone}</strong> within 2 hours.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-2.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase"
          >
            Close Window
          </button>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexander Mercer"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.name ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexander@mail.com"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.email ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Phone & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.phone ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.phone && <p className="mt-1 text-[10px] text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Booking Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                    errors.date ? 'border-red-500' : 'border-gold-400/15'
                  }`}
                />
              </div>
              {errors.date && <p className="mt-1 text-[10px] text-red-500">{errors.date}</p>}
            </div>
          </div>

          {/* Row 3: Event Type & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
              >
                <option value="wedding">Wedding</option>
                <option value="reception">Reception</option>
                <option value="engagement">Engagement</option>
                <option value="birthday">Birthday Party</option>
                <option value="corporate">Corporate Event</option>
                <option value="anniversary">Anniversary</option>
                <option value="cultural">Cultural Function</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Estimated Guest Count
              </label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="100"
                max="2000"
                placeholder="300"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
              />
            </div>
          </div>

          {/* Row 4: Package Tier */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-2">
              Selected Package Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['silver', 'gold', 'platinum'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setPkg(tier)}
                  className={`rounded-xl border py-2.5 text-center text-xs transition-all uppercase tracking-wider font-semibold ${
                    pkg === tier
                      ? 'border-gold-400 bg-gold-400/10 text-gold-500'
                      : 'border-gold-400/15 bg-ivory-50 text-foreground/75 dark:bg-zinc-900 hover:border-gold-400/40'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Special Decoration Requests / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us about your theme wishes..."
              rows={2}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
            />
          </div>

          {/* Cost Indicator & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gold-400/15 pt-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-foreground/50">Dynamic Estimate</p>
                <p className="font-serif text-lg font-bold text-gold-500">₹{cost.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Submit Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </CustomDialog>
  );
}
