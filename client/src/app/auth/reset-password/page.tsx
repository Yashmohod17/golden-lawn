'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AuthResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const token = searchParams ? searchParams.get('token') || '' : '';

    if (!token) {
      setError('Reset token is missing. Please initiate forgot password first.');
      return;
    }

    setIsLoading(true);

    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(data.error || 'Failed to reset password. The code might be expired.');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError('Network error. Failed to reset password.');
      });
  };

  return (
    <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 shadow-2xl relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
      
      {success ? (
        /* Success Screen */
        <div className="text-center py-6 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Password Reset!
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
              Your credentials have been successfully updated. You may now return to authorization.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 transition-all cursor-pointer"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Form Box */
        <div className="space-y-5">
          <div className="text-center mb-6">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Set New Password
            </h3>
            <p className="text-xs text-foreground/50 mt-1">
              Establish a secure credentials key for your customer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-10 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/45 hover:text-gold-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-10 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
                />
              </div>
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
                <span>Confirm Reset Password</span>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
