'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, Sparkles, Key } from 'lucide-react';

type Step = 'EMAIL' | 'OTP';

export default function AuthForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  
  // OTP input states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle OTP resend countdown
  useEffect(() => {
    if (step !== 'OTP') return;
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email format.');
      return;
    }

    setIsLoading(true);

    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setStep('OTP');
          setResendTimer(30);
          setCanResend(false);
          setSuccess(`A verification OTP code has been sent to ${email}. Demo Code: ${data.resetCode}`);
        } else {
          setError(data.error || 'Failed to request reset OTP.');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError('Network error. Failed to send reset OTP.');
      });
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input element automatically
    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const target = e.target as HTMLInputElement;
      if (target.value === '' && target.previousSibling) {
        (target.previousSibling as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please fill in the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push(`/auth/reset-password?token=${otpCode}`);
    }, 500);
  };

  const handleResendOtp = () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setResendTimer(30);
          setCanResend(false);
          setSuccess(`A fresh OTP code has been generated. Demo Code: ${data.resetCode}`);
          setOtp(['', '', '', '', '', '']);
        } else {
          setError(data.error || 'Failed to resend code.');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError('Network error. Failed to resend code.');
      });
  };

  return (
    <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 shadow-2xl relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
      
      {/* Back to Login link */}
      <Link 
        href="/auth/login" 
        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-gold-500 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Login</span>
      </Link>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Capture Email */}
        {step === 'EMAIL' && (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Recover Password
              </h3>
              <p className="text-xs text-foreground/50 mt-1">
                Enter your registered email address to receive a verification OTP code
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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
                    placeholder="e.g. rajesh@gmail.com"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate OTP</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Validate OTP code */}
        {step === 'OTP' && (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center mb-4">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Enter OTP Code
              </h3>
              <p className="text-xs text-foreground/50 mt-1">
                A 6-digit confirmation key has been generated
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10">
                  <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Six Code Box Inputs Grid */}
              <div className="flex justify-between gap-2 py-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    disabled={isLoading}
                    className="w-11 h-12 text-center rounded-xl border border-gold-400/20 bg-ivory-50 dark:bg-zinc-900/50 text-foreground text-sm font-bold outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all font-mono"
                  />
                ))}
              </div>

              {/* Demo Hint */}
              <div className="text-[10px] text-foreground/50 bg-gold-400/5 p-3 rounded-lg border border-gold-400/10 text-center font-semibold">
                Simulation Mode: Enter <code className="text-gold-500 font-bold text-xs">123456</code> to complete OTP verification.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="h-3.5 w-3.5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              {/* Resend Controls */}
              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-gold-600 hover:text-gold-500 transition-colors uppercase tracking-wider underline cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                ) : (
                  <span className="text-xs text-foreground/40 font-medium">
                    Resend code in {resendTimer}s
                  </span>
                )}
              </div>

            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
