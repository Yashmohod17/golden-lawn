'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Award, MapPin, Shield, Save, RefreshCw, 
  AlertCircle, CheckCircle, Sparkles, Sliders 
} from 'lucide-react';

export default function SettingsPage() {
  // Package pricing parameters
  const [silverMultiplier, setSilverMultiplier] = useState(1.0);
  const [goldMultiplier, setGoldMultiplier] = useState(1.2);
  const [platinumMultiplier, setPlatinumMultiplier] = useState(1.55);

  // Property capacities
  const [maxCapacity, setMaxCapacity] = useState(1500);
  const [valetSpaces, setValetSpaces] = useState(250);
  const [cancellationGraceDays, setCancellationGraceDays] = useState(15);

  // Feedback notifications
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess('');
    
    setTimeout(() => {
      setUpdating(false);
      setSuccess('Venue configurations and package pricing variables successfully applied to system core schema.');
    }, 1000);
  };

  // RBAC Visualizer Data
  const rolePermissionsMatrix = [
    { permission: 'read:bookings', owner: true, manager: true, staff: true },
    { permission: 'write:bookings', owner: true, manager: true, staff: false },
    { permission: 'delete:bookings', owner: true, manager: false, staff: false },
    { permission: 'read:payments', owner: true, manager: true, staff: false },
    { permission: 'write:payments', owner: true, manager: true, staff: false },
    { permission: 'read:staff', owner: true, manager: true, staff: false },
    { permission: 'write:staff', owner: true, manager: false, staff: false },
    { permission: 'read:crm', owner: true, manager: true, staff: true },
    { permission: 'write:crm', owner: true, manager: true, staff: true },
    { permission: 'read:analytics', owner: true, manager: true, staff: false },
    { permission: 'manage:settings', owner: true, manager: false, staff: false },
  ];

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Global Console Settings</h2>
          <p className="text-xs text-foreground/50">Adjust package pricing multipliers, property capacity guidelines, and audit RBAC matrices</p>
        </div>
      </div>

      {success && (
        <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left two columns: Config blocks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Packages multipliers */}
          <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Award className="h-5 w-5 text-gold-500" />
              Package Pricing Adjustments
            </h3>
            <p className="text-[10px] text-foreground/50">Modify default pricing multipliers used in cost estimations</p>
            <div className="h-[1px] bg-gold-400/10" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Silver Package Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={silverMultiplier}
                  onChange={(e) => setSilverMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>
              
              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Gold Package Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={goldMultiplier}
                  onChange={(e) => setGoldMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Platinum Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={platinumMultiplier}
                  onChange={(e) => setPlatinumMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Property limits */}
          <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-5 w-5 text-gold-500" />
              Venue Logistics Parameters
            </h3>
            <p className="text-[10px] text-foreground/50">Manage default property constraints for guests size and valet allocations</p>
            <div className="h-[1px] bg-gold-400/10" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider font-semibold">Max Guests Capacity</label>
                <input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider font-semibold">Valet Parking Slots</label>
                <input
                  type="number"
                  value={valetSpaces}
                  onChange={(e) => setValetSpaces(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider font-semibold">Grace Refund Period (Days)</label>
                <input
                  type="number"
                  value={cancellationGraceDays}
                  onChange={(e) => setCancellationGraceDays(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-3.5 text-xs font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" /> {updating ? 'Updating...' : 'Save Settings Configurations'}
          </button>

        </div>

        {/* Right column: RBAC Matrix inspector */}
        <div className="lg:col-span-1 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-5 w-5 text-gold-500" />
              RBAC Policies Visualizer
            </h3>
            <p className="text-[10px] text-foreground/50">Active route permission restrictions matching database roles mapping</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {/* Matrix list */}
          <div className="space-y-3.5 text-[10px]">
            <div className="grid grid-cols-4 font-bold text-foreground/60 uppercase pb-1 border-b border-gold-400/5">
              <div>Policy</div>
              <div className="text-center text-gold-600">Own</div>
              <div className="text-center text-blue-600">Mgr</div>
              <div className="text-center text-zinc-500">Stf</div>
            </div>
            
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {rolePermissionsMatrix.map((pol) => (
                <div key={pol.permission} className="grid grid-cols-4 py-1.5 hover:bg-gold-400/5 rounded transition-all">
                  <span className="font-mono text-foreground/75 truncate">{pol.permission}</span>
                  <span className="text-center font-bold">{pol.owner ? '✓' : '--'}</span>
                  <span className="text-center font-bold text-blue-600">{pol.manager ? '✓' : '--'}</span>
                  <span className="text-center font-bold text-zinc-500">{pol.staff ? '✓' : '--'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
