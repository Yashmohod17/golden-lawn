'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('admin_auth');
      if (auth === 'true') {
        router.push('/admin');
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Simulate network authentication delay
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password.trim() === 'admin123') {
        sessionStorage.setItem('admin_auth', 'true');
        router.push('/admin');
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 1000);
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
        className="w-full max-w-md glass-panel rounded-3xl border border-gold-400/20 p-8 shadow-2xl z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-500 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-wide text-foreground">
            Admin Portal
          </h2>
          <p className="mt-2 text-xs text-foreground/60 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            The Golden Celebrations Lawn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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

          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
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
                placeholder="Enter credentials"
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all"
              />
            </div>
          </div>

          {/* Tips Info Box */}
          <div className="text-[10px] leading-relaxed text-foreground/50 bg-gold-400/5 p-3 rounded-lg border border-gold-400/10">
            <strong>Simulation Access:</strong> Use username <code className="text-gold-500 font-bold">admin</code> and password <code className="text-gold-500 font-bold">admin123</code> to log into the inquiries database.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
