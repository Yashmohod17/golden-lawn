'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, User, Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AuthRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [eventInterest, setEventInterest] = useState('wedding');

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'None', color: 'bg-zinc-200' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Monitor password strength updates
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'None', color: 'bg-zinc-200' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score === 2) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validations
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required inputs.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email format.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit phone directory.');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Please create a more secure password (Medium/Strong).');
      return;
    }

    setIsLoading(true);

    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        address: 'Nagpur, Maharashtra, India', // Default billing address placeholder
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setSuccess(`Congratulations, ${name}! Your customer account has been created. Proceed to login below.`);
          // Clear Form on success
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
        } else {
          setError(data.error || 'Failed to create account.');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError('Network error. Failed to create account.');
      });
  };

  return (
    <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 shadow-2xl relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
      
      {/* Header Info */}
      <div className="text-center mb-6">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Create Account
        </h3>
        <p className="text-xs text-foreground/50 mt-1">
          Join the Golden Celebrations Lawn customer registry
        </p>
      </div>

      {/* Form Details */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              disabled={isLoading}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rajesh@gmail.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
              <Phone className="h-4 w-4" />
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              disabled={isLoading}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Event Interest Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
            Primary Celebration Interest
          </label>
          <select
            value={eventInterest}
            onChange={(e) => setEventInterest(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 px-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
          >
            <option value="wedding">Wedding Ceremony / Reception</option>
            <option value="anniversary">Anniversary Celebration</option>
            <option value="corporate">Corporate Gala & Banquets</option>
            <option value="birthday">Private Birthday Celebrations</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
            Create Password *
          </label>
          <div className="relative mb-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={isLoading}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
            />
          </div>

          {/* Strength Indicators */}
          {password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-foreground/50 uppercase">
                <span>Strength Meter</span>
                <span className="font-extrabold">{passwordStrength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`} 
                  style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-8 pt-5 border-t border-gold-400/10 text-center">
        <p className="text-xs text-foreground/50">
          Already have an account?{' '}
          <Link 
            href="/portal/login" 
            className="font-bold text-gold-600 hover:text-gold-500 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

    </div>
  );
}
