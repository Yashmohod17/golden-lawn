'use client';

import React, { useState } from 'react';
import { Sparkles, Calculator, Check, AlertCircle } from 'lucide-react';
import { useInquiry } from '../lib/InquiryContext';

const eventTypes = [
  { id: 'wedding', name: 'Wedding', multiplier: 1.2 },
  { id: 'reception', name: 'Reception', multiplier: 1.1 },
  { id: 'engagement', name: 'Engagement', multiplier: 1.0 },
  { id: 'birthday', name: 'Birthday Party', multiplier: 0.8 },
  { id: 'corporate', name: 'Corporate Event', multiplier: 1.15 },
  { id: 'cultural', name: 'Cultural Function', multiplier: 1.0 },
];

const packages = [
  { id: 'silver', name: 'Silver Package', basePerGuest: 1200 },
  { id: 'gold', name: 'Gold Package', basePerGuest: 2500 },
  { id: 'platinum', name: 'Platinum Package', basePerGuest: 4500 },
];

const addonsList = [
  { id: 'catering', name: 'Premium Catering (Buffet)', cost: 500, perGuest: true },
  { id: 'stage', name: 'Luxury Stage Setup', cost: 150000, perGuest: false },
  { id: 'floral', name: 'Exotic Floral Decoration', cost: 100000, perGuest: false },
  { id: 'photography', name: 'Candid Photo & Video', cost: 120000, perGuest: false },
  { id: 'dj', name: 'Premium DJ & Sound System', cost: 60000, perGuest: false },
  { id: 'guest_mgmt', name: 'VIP Guest Management', cost: 80000, perGuest: false },
];

export function CostEstimator() {
  const { openInquiry } = useInquiry();
  const [eventType, setEventType] = useState('wedding');
  const [guestCount, setGuestCount] = useState(300);
  const [selectedPackage, setSelectedPackage] = useState('gold');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['catering', 'stage']);

  const activeEvent = eventTypes.find((e) => e.id === eventType) || eventTypes[0];
  const activePkg = packages.find((p) => p.id === selectedPackage) || packages[1];
  
  // Base cost calculation
  const base = activePkg.basePerGuest * guestCount * activeEvent.multiplier;

  // Addons calculation
  let addonsTotal = 0;
  selectedAddons.forEach((addonId) => {
    const addon = addonsList.find((a) => a.id === addonId);
    if (addon) {
      if (addon.perGuest) {
        addonsTotal += addon.cost * guestCount;
      } else {
        addonsTotal += addon.cost;
      }
    }
  });

  const totalCost = Math.round(base + addonsTotal);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInquirySubmit = () => {
    const pkgName = packages.find(p => p.id === selectedPackage)?.name || 'Gold Package';
    openInquiry(pkgName, '', totalCost);
  };

  return (
    <div className="rounded-3xl border border-gold-400/20 bg-ivory-100 p-6 shadow-xl dark:bg-zinc-950 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
            Cost Estimator
          </h3>
          <p className="text-xs text-foreground/60">Calculate approximate budgets instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Column */}
        <div className="space-y-6">
          {/* Event Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-xl border border-gold-400/20 bg-ivory-50 px-4 py-3 text-sm text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
            >
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Guest Count Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                Number of Guests
              </label>
              <span className="font-serif text-base font-bold text-gold-500">
                {guestCount} Guests
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full h-1.5 bg-gold-400/15 rounded-lg appearance-none cursor-pointer accent-gold-400"
            />
            <div className="flex justify-between text-[10px] text-foreground/40 mt-1">
              <span>100 Guests</span>
              <span>2,000 Guests</span>
            </div>
          </div>

          {/* Packages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-3">
              Select Package Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`rounded-xl border py-3 text-center transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-gold-400 bg-gold-400/10 text-gold-500 font-semibold'
                      : 'border-gold-400/10 bg-ivory-50 text-foreground/75 dark:bg-zinc-900 hover:border-gold-400/40'
                  }`}
                >
                  <span className="block text-sm">{pkg.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-60">₹{pkg.basePerGuest}/guest</span>
                </button>
              ))}
            </div>
          </div>

          {/* Addons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-3">
              Optional Add-ons
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addonsList.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-gold-400 bg-gold-400/10 text-foreground'
                        : 'border-gold-400/10 bg-ivory-50 text-foreground/70 dark:bg-zinc-900 hover:border-gold-400/40'
                    }`}
                  >
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected ? 'border-gold-400 bg-gold-400 text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="text-xs">
                      <span className="block font-medium">{addon.name}</span>
                      <span className="text-[10px] text-foreground/50">
                        {addon.perGuest ? `+₹${addon.cost}/guest` : `+₹${addon.cost.toLocaleString()}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Column */}
        <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gold-400/15 pt-6 lg:pt-0 lg:pl-8">
          <div>
            <h4 className="font-serif text-lg font-bold tracking-wide text-foreground mb-4">
              Estimated Quote
            </h4>
            
            {/* Price Display */}
            <div className="bg-gold-400/5 rounded-2xl border border-gold-400/15 p-6 text-center mb-6">
              <span className="text-xs tracking-widest text-gold-500 font-sans uppercase">
                Estimated Total
              </span>
              <div className="font-serif text-4xl md:text-5xl font-black text-gold-500 tracking-tight mt-1">
                ₹{totalCost.toLocaleString()}
              </div>
              <p className="text-[10px] text-foreground/50 mt-2">
                *Inclusive of all taxes & setup charges
              </p>
            </div>

            {/* Quote details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/60">Event Selection multiplier:</span>
                <span className="font-semibold text-foreground">
                  {eventTypes.find(e => e.id === eventType)?.name} ({eventTypes.find(e => e.id === eventType)?.multiplier}x)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Guests count rate:</span>
                <span className="font-semibold text-foreground">
                  ₹{packages.find(p => p.id === selectedPackage)?.basePerGuest} per guest
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Selected Add-ons total:</span>
                <span className="font-semibold text-foreground">
                  ₹{(totalCost - Math.round((packages.find(p => p.id === selectedPackage)?.basePerGuest || 0) * guestCount * (eventTypes.find(e => e.id === eventType)?.multiplier || 1))).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-2 text-[10px] text-foreground/50 bg-amber-400/5 p-3 rounded-lg border border-amber-400/10">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Note: This is an AI-assisted cost simulation estimate. Exact pricing quotes are finalized by our coordinators after assessing final decorations.
              </span>
            </div>

            <button
              onClick={handleInquirySubmit}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-4 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all duration-300"
            >
              <Sparkles className="h-4 w-4" />
              Book With This Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
