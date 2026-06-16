'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, User, KeyRound } from 'lucide-react';

type Role = 'CUSTOMER' | 'COORDINATOR';

export default function AuthLogin() {
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email format.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate API authorization response latency
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(`Welcome back! Authorized successfully as ${role === 'CUSTOMER' ? 'Rajesh Kumar' : 'Stage Director'}.`);
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 shadow-2xl relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
      
      {/* Tab Selectors */}
      <div className="flex bg-gold-400/5 dark:bg-gold-400/3 p-1 rounded-2xl border border-gold-400/10 mb-8">
        <button
          type="button"
          onClick={() => {
            setRole('CUSTOMER');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            role === 'CUSTOMER'
              ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 shadow-md font-extrabold'
              : 'text-foreground/50 hover:text-foreground/75'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Customer</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('COORDINATOR');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            role === 'COORDINATOR'
              ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 shadow-md font-extrabold'
              : 'text-foreground/50 hover:text-foreground/75'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Coordinator</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="text-center mb-6">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Sign In Console
        </h3>
        <p className="text-xs text-foreground/50 mt-1">
          {role === 'CUSTOMER' 
            ? 'Manage your custom layouts & view statements' 
            : 'Access event staging lists & coordination milestones'}
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
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. guest@celebration.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Password
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Authorize Sign In</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-8 pt-5 border-t border-gold-400/10 text-center">
        <p className="text-xs text-foreground/50">
          New client to Golden Lawn?{' '}
          <Link 
            href="/auth/register" 
            className="font-bold text-gold-600 hover:text-gold-500 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>

    </div>
  );
}
