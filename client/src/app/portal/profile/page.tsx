'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, MapPin, Sparkles, 
  CheckCircle2, Lock, Save, Settings, Calendar 
} from 'lucide-react';
import { usePortal } from '../../../lib/PortalContext';

export default function CustomerProfile() {
  const { user, updateProfile, changePassword } = usePortal();

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // Preferences Form State
  const [cateringPref, setCateringPref] = useState(user?.cateringPref || '');
  const [themePref, setThemePref] = useState(user?.themePref || '');
  const [contactPref, setContactPref] = useState(user?.contactPref || '');

  // Password Form State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status indicators
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(false);

    updateProfile({ name, phone, email, address });
    setInfoSuccess(true);
    setTimeout(() => setInfoSuccess(false), 3000);
  };

  const handlePrefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSuccess(false);

    updateProfile({ cateringPref, themePref, contactPref });
    setPrefSuccess(true);
    setTimeout(() => setPrefSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess(false);
    setPwError('');

    if (!currPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    const res = await changePassword(currPassword, newPassword);
    if (res.success) {
      setPwSuccess(true);
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError(res.error || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
          My Account & Preferences
        </h1>
        <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold-500" />
          Customize arrangement preferences and keep contact directories updated
        </p>
      </div>

      {/* Grid: Profile settings card + details edit forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-gold-400/15 border-2 border-gold-400/40 text-gold-500 flex items-center justify-center font-serif text-3xl font-bold shadow-inner">
              {user?.avatar || 'RK'}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-foreground truncate">{user?.name}</h3>
              <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
              <span className="inline-block mt-2 rounded-full bg-gold-400/10 border border-gold-400/25 px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                Verified Customer
              </span>
            </div>

            <div className="border-t border-gold-400/10 pt-5 text-left text-xs text-foreground/75 space-y-3.5">
              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-gold-500 shrink-0" />
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Member Since</span>
                  <span className="font-semibold text-foreground">{user?.joinedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="h-4.5 w-4.5 text-gold-500 shrink-0" />
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Preferences Status</span>
                  <span className="font-semibold text-foreground">Custom Inclusions Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Form 1: Personal Info */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gold-400/5">
              <h3 className="font-serif text-lg font-bold text-foreground">Contact Information</h3>
              {infoSuccess && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved Successfully
                </span>
              )}
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Phone Directory
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Billing Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start text-foreground/45">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Info Details</span>
              </button>
            </form>
          </div>

          {/* Form 2: Preferences */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gold-400/5">
              <h3 className="font-serif text-lg font-bold text-foreground">Arrangement Preferences</h3>
              {prefSuccess && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved Successfully
                </span>
              )}
            </div>

            <form onSubmit={handlePrefSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Preferred Catering Style
                  </label>
                  <select
                    value={cateringPref}
                    onChange={(e) => setCateringPref(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="Traditional Veg Indian (Buffet)">Traditional Veg Indian (Buffet)</option>
                    <option value="Multi-Cuisine Fusion Banquet">Multi-Cuisine Fusion Banquet</option>
                    <option value="Premium Royal Mughal Feast">Premium Royal Mughal Feast</option>
                    <option value="Continental & Italian Cocktail">Continental & Italian Cocktail Buffet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Theme / Decor Style
                  </label>
                  <select
                    value={themePref}
                    onChange={(e) => setThemePref(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="Royal Ivory & Marigold Gold">Royal Ivory & Marigold Gold</option>
                    <option value="Burgundy Silk & Cream Rose Glimmer">Burgundy Silk & Cream Rose Glimmer</option>
                    <option value="Fairy-light Forest & White Jasmine">Fairy-light Forest & White Jasmine</option>
                    <option value="Modern Pastel Orchids & Silver Arch">Modern Pastel Orchids & Silver Arch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Primary Contact Method
                </label>
                <select
                  value={contactPref}
                  onChange={(e) => setContactPref(e.target.value)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                >
                  <option value="WhatsApp & Email">WhatsApp & Email (Recommended)</option>
                  <option value="Direct Phone Calls Only">Direct Phone Calls Only</option>
                  <option value="Email & In-App Portal alerts">Email & In-App Portal alerts</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Preferences</span>
              </button>
            </form>
          </div>

          {/* Form 3: Password Update */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gold-400/5">
              <h3 className="font-serif text-lg font-bold text-foreground">Update Portal Password</h3>
              {pwSuccess && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Password updated
                </span>
              )}
            </div>

            {pwError && (
              <div className="text-xs text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-3 font-sans text-xs font-bold tracking-wider text-zinc-950 uppercase shadow-md transition-colors cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>Confirm Change Password</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
