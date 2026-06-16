'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Lock, KeyRound, CheckCircle, AlertCircle, 
  ShieldCheck, Sparkles, LogOut, Save 
} from 'lucide-react';
import { useAdmin } from '../../../lib/AdminContext';

export default function ProfilePage() {
  const { adminUser, logout } = useAdmin();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback notification states
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all security fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_access_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update administrative password credentials.');
      }

      setSuccess('Administrative security credentials updated successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Forces logout for security after a password reset
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error occurred while resetting password.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Account Profile</h2>
          <p className="text-xs text-foreground/50">Manage your credentials and view account role authorization privileges</p>
        </div>
      </div>

      {success && (
        <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-gold-400/10 text-gold-500 flex items-center justify-center font-serif text-3xl font-bold border-2 border-gold-400/20 shadow-md">
              {adminUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">{adminUser?.name}</h3>
              <p className="text-xs text-foreground/50">{adminUser?.email}</p>
            </div>

            <span className="rounded-full bg-gold-500 text-zinc-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {adminUser?.role?.name || 'STAFF'}
            </span>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {/* User Privileges indicators */}
          <div className="space-y-3.5 text-xs text-foreground/85">
            <span className="block text-[9px] font-bold text-foreground/45 uppercase tracking-wider">Role Access Status</span>
            
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Console: ENABLED</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-gold-500" />
              <span>Priority: {adminUser?.role?.name === 'OWNER' ? 'Unlimited Bypass' : 'Restricted Policy'}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Password Form */}
        <div className="lg:col-span-2 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="h-5 w-5 text-gold-500" />
              Security Password Adjustment
            </h3>
            <p className="text-[10px] text-foreground/50">Update database-backed JWT password credentials for console log in</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-gold-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-gold-400 font-semibold"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-gold-400 font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" /> {updating ? 'Saving...' : 'Save Security Credentials'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
