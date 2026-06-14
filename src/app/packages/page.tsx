'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Sparkles, Star } from 'lucide-react';
import { useInquiry } from '../../context/InquiryContext';

const packages = [
  {
    name: 'Silver Package',
    badge: 'Standard Selection',
    desc: 'Perfect for intimate celebrations, small gatherings, and simple family gatherings.',
    price: '₹1,200',
    color: 'border-zinc-300 dark:border-zinc-700 bg-zinc-400/5',
    accent: 'bg-zinc-400 text-zinc-950',
    features: [
      { name: 'Basic Flower & Light Decor', included: true },
      { name: 'Full Lawn Access (8 hrs)', included: true },
      { name: 'Standard Seating Setup', included: true },
      { name: 'Standard Sound System', included: true },
      { name: 'Catering Kitchen Access', included: true },
      { name: 'Dedicated Stage Setup', included: false },
      { name: 'Photography & Video', included: false },
      { name: 'Complete Event Planning', included: false },
      { name: 'VIP Guest Assistance & Valet', included: false },
    ],
  },
  {
    name: 'Gold Package',
    badge: 'Most Popular',
    desc: 'Tailored for elegant evening receptions, engagements, and corporate banquets.',
    price: '₹2,500',
    color: 'border-gold-400/40 bg-gold-400/5',
    accent: 'bg-gold-400 text-zinc-950',
    popular: true,
    features: [
      { name: 'Premium Flower & Light Decor', included: true },
      { name: 'Full Lawn Access (12 hrs)', included: true },
      { name: 'Designer Seating Setup', included: true },
      { name: 'High-definition Sound System', included: true },
      { name: 'In-house Catering Support', included: true },
      { name: 'Custom Stage Decoration', included: true },
      { name: 'Candid Photography Support', included: true },
      { name: 'Complete Event Planning', included: false },
      { name: 'VIP Guest Assistance & Valet', included: false },
    ],
  },
  {
    name: 'Platinum Package',
    badge: 'Luxury Unlimited',
    desc: 'Our flagship wedding experience, handling every detail to majestic gold standards.',
    price: '₹4,500',
    color: 'border-burgundy-500/35 bg-burgundy-600/5',
    accent: 'bg-burgundy-600 text-white',
    features: [
      { name: 'Luxury Flower & Light Decor', included: true },
      { name: 'Full Lawn Access (24 hrs)', included: true },
      { name: 'Royal Seating Arrangements', included: true },
      { name: 'Concert Sound System & DJ', included: true },
      { name: 'Premium Multi-cuisine Catering', included: true },
      { name: 'Bespoke Stage Artistry', included: true },
      { name: 'Drone & Candid Photo/Video', included: true },
      { name: 'Complete Event Management', included: true },
      { name: 'VIP Valet & Guest Support Suite', included: true },
    ],
  },
];

const comparisonMatrix = [
  { feature: 'Lawn Access Hours', silver: '8 Hours', gold: '12 Hours', platinum: '24 Hours' },
  { feature: 'Decoration Class', silver: 'Basic', gold: 'Premium Design', platinum: 'Bespoke Artistry' },
  { feature: 'Stage Dimensions', silver: '12x10 ft', gold: '24x16 ft', platinum: '40x24 ft (Grand)' },
  { feature: 'Groom Suite Access', silver: 'Not Included', gold: '1 Suite (A/C)', platinum: '2 Suites (A/C)' },
  { feature: 'Catering Support', silver: 'Kitchen Access Only', gold: 'Buffet Setup (3 Course)', platinum: 'Royal Buffet (5 Course)' },
  { feature: 'Sound & DJ system', silver: 'PA Speakers', gold: 'Pro Stage Sound', platinum: 'Concert Array + Smoke DJ' },
  { feature: 'Valet Parking', silver: 'Self-Park', gold: 'Included (100 cars)', platinum: 'VIP Valet (Unlimited)' },
];

export default function Packages() {
  const { openInquiry } = useInquiry();

  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Pricing Plans
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Bespoke Event Packages
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/60 leading-relaxed">
          Explore our silver, gold, and platinum selections designed to match event sizes, guest lists, and customized decoration budgets.
        </p>
      </div>

      {/* Package cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl border p-6 flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 ${pkg.color}`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1 shadow-md">
                  <Star className="h-3 w-3 fill-zinc-950" /> {pkg.badge}
                </span>
              )}

              <div>
                {/* Header */}
                <div className="text-center mb-6 pt-4">
                  {!pkg.popular && (
                    <span className="text-[10px] font-semibold tracking-wider text-foreground/50 uppercase">
                      {pkg.badge}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-foreground/60 mt-2 leading-relaxed min-h-[2.5rem]">
                    {pkg.desc}
                  </p>
                  
                  {/* Price */}
                  <div className="mt-4 flex items-baseline justify-center gap-1 text-gold-500">
                    <span className="font-serif text-3xl font-extrabold">{pkg.price}</span>
                    <span className="text-xs text-foreground/50">/guest</span>
                  </div>
                </div>

                <div className="h-[1px] bg-gold-400/10 my-4" />

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-foreground/85 dark:text-foreground/70">
                      {feat.included ? (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-red-500/40 shrink-0" />
                      )}
                      <span className={feat.included ? '' : 'text-foreground/40 line-through'}>
                        {feat.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inquiry Button */}
              <button
                onClick={() => openInquiry(pkg.name)}
                className={`w-full rounded-xl py-3.5 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all ${pkg.accent}`}
              >
                Inquire Package
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl font-bold text-foreground tracking-wide">
            Feature Comparison Matrix
          </h2>
          <div className="luxury-divider !my-4" />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gold-400/15 shadow-md">
          <table className="w-full border-collapse text-left text-xs bg-ivory-50 dark:bg-zinc-900/30">
            <thead>
              <tr className="border-b border-gold-400/20 bg-gold-400/5 font-serif text-sm font-bold text-foreground">
                <th className="p-4">Event Feature</th>
                <th className="p-4">Silver</th>
                <th className="p-4">Gold</th>
                <th className="p-4">Platinum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/10 text-foreground/80">
              {comparisonMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gold-400/5 transition-colors">
                  <td className="p-4 font-medium text-foreground">{row.feature}</td>
                  <td className="p-4 text-foreground/70">{row.silver}</td>
                  <td className="p-4 text-foreground/75 font-semibold text-gold-500">{row.gold}</td>
                  <td className="p-4 text-foreground/80 font-bold">{row.platinum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
