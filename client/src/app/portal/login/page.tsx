'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, Sparkles, LogIn } from 'lucide-react';
import { usePortal } from '../../../lib/PortalContext';

export default function CustomerLogin() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = usePortal();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/portal');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(username, password);

    if (success) {
      router.push('/portal');
    } else {
      setError('Invalid email/username or password. Hint: Use the demo autofill.');
      setIsSubmitting(false);
    }
  };

  const handleAutofill = () => {
    setUsername('rajesh.kumar@gmail.com');
    setPassword('customer123');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 bg-ivory-50 dark:bg-zinc-950 overflow-hidden py-12">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-gold-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-burgundy-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel rounded-3xl border border-gold-400/20 p-8 shadow-2xl z-10"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-500 shadow-inner mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            Customer Portal
          </h2>
          <p className="mt-2 text-xs text-foreground/60 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            Manage Your Golden Events
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

          {/* Email/Username */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="rajesh.kumar@gmail.com"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
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
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3.5 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
              />
            </div>
          </div>

          {/* Helper details box */}
          <div className="flex flex-col gap-2 text-[11px] leading-relaxed text-foreground/60 bg-gold-400/5 p-4 rounded-xl border border-gold-400/10">
            <div className="flex items-center gap-1.5 font-semibold text-gold-600 dark:text-gold-400">
              <Sparkles className="h-3 w-3" />
              <span>Testing Credentials</span>
            </div>
            <p>Username: <code className="text-foreground font-bold">rajesh</code> or <code className="text-foreground font-bold">rajesh.kumar@gmail.com</code></p>
            <p>Password: <code className="text-foreground font-bold">customer123</code></p>
            
            <button
              type="button"
              onClick={handleAutofill}
              className="mt-1 self-start font-sans text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Demo Autofill
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-4 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Verifying...' : 'Access Portal'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
