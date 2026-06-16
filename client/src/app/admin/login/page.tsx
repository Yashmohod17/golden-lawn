'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAdmin } from '../../../lib/AdminContext';

export default function AdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email.trim(), password);
    setIsSubmitting(false);

    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 bg-ivory-50 dark:bg-zinc-950 overflow-hidden">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-gold-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-burgundy-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel rounded-3xl border border-gold-400/20 p-8 shadow-2xl z-10 bg-white/70 dark:bg-zinc-900/70"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-500 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-wide text-foreground">
            Admin Console
          </h2>
          <p className="mt-2 text-[10px] text-foreground/60 tracking-wider uppercase flex items-center justify-center gap-1.5 font-semibold">
            <Sparkles className="h-3 w-3 text-gold-500" />
            Authorized Personnel Only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@goldencelebration.com"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                required
              />
            </div>
          </div>

          {/* Helpful Credentials Guideline */}
          <div className="text-[10px] leading-relaxed text-foreground/50 bg-gold-400/5 p-3.5 rounded-xl border border-gold-400/10 space-y-1">
            <span className="font-bold block text-foreground">Available Accounts:</span>
            <div className="flex justify-between">
              <span>Owner: <code className="text-gold-500 font-bold">owner@goldencelebration.com</code></span>
              <code className="text-foreground/70 font-semibold">owner123</code>
            </div>
            <div className="flex justify-between">
              <span>Manager: <code className="text-gold-500 font-bold">manager@goldencelebration.com</code></span>
              <code className="text-foreground/70 font-semibold">manager123</code>
            </div>
            <div className="flex justify-between">
              <span>Staff: <code className="text-gold-500 font-bold">staff@goldencelebration.com</code></span>
              <code className="text-foreground/70 font-semibold">staff123</code>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
