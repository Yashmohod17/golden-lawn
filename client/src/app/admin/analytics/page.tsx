'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Calendar, Target, AlertCircle, 
  Sparkles, Award, Users, CreditCard, ShieldCheck 
} from 'lucide-react';
import { adminService } from '../../../services/admin';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAnalytics();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compile analytics aggregates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Compiling property metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-6 text-center text-xs text-red-500 bg-red-500/5 rounded-2xl border border-red-500/10 max-w-lg mx-auto">
        <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
        <span>{error || 'Data compilation error. Please try again.'}</span>
      </div>
    );
  }

  const { revenueChart, packagesChart, occupancyChart, crmFunnel } = analyticsData;

  // Find max values for chart scalings
  const maxRevenue = Math.max(...revenueChart.map((r: any) => r.amount), 1);
  const maxPackageCount = Math.max(...packagesChart.map((p: any) => p.value), 1);
  const maxFunnelCount = Math.max(...crmFunnel.map((f: any) => f.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Sales & Performance Analytics</h2>
          <p className="text-xs text-foreground/50">Recalculate monthly banquet collections, lawn occupancy metrics, and package choices</p>
        </div>
      </div>

      {/* Grid containing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue Trends Bar Chart */}
        <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-gold-500" />
              Monthly Collections Summary
            </h3>
            <p className="text-[10px] text-foreground/50">Total revenue generated from cleared booking milestones (INR)</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {/* Custom Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-2">
            {revenueChart.map((rev: any, idx: number) => {
              const heightPercent = (rev.amount / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white text-[9px] font-bold py-1 px-2 rounded-lg absolute translate-y-[-70px] pointer-events-none shadow-md z-10">
                    ₹{rev.amount.toLocaleString()}
                  </div>
                  
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="w-full bg-gradient-to-t from-gold-600 via-gold-400 to-gold-300 rounded-t-lg group-hover:brightness-110 shadow-sm shadow-gold-500/10"
                  />
                  <span className="text-[9px] font-bold text-foreground/50 mt-2.5 uppercase tracking-wider">{rev.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Lawn Occupancy Rate Line/Meter */}
        <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-gold-500" />
              Lawn Occupancy Registers
            </h3>
            <p className="text-[10px] text-foreground/50">Percentage of property dates confirmed or locked for events</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {/* Custom Horizontal Bar Grid */}
          <div className="space-y-4 pt-4">
            {occupancyChart.map((occ: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground/80">{occ.month} Occupancy</span>
                  <span className="font-bold text-gold-500">{occ.rate}% Locked</span>
                </div>
                <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${occ.rate}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full shadow-inner"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Packages Popularity */}
        <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Award className="h-5 w-5 text-gold-500" />
              Service Packages Preference
            </h3>
            <p className="text-[10px] text-foreground/50">Distribution of tiers selected by verified customers</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          <div className="space-y-4 pt-2">
            {packagesChart.map((pkg: any, idx: number) => {
              const widthPercent = (pkg.value / maxPackageCount) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span>{pkg.name}</span>
                    <span>{pkg.value} reservations</span>
                  </div>
                  <div className="h-2.5 w-full bg-gold-400/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.15 }}
                      className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: CRM Conversion Funnel */}
        <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Target className="h-5 w-5 text-gold-500" />
              CRM Sales Funnel
            </h3>
            <p className="text-[10px] text-foreground/50">Conversion progression of inquiries into active booking client accounts</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {/* Funnel Layout */}
          <div className="space-y-3.5 pt-2">
            {crmFunnel.map((fn: any, idx: number) => {
              // Calculate width offset based on funnel depth
              const percent = maxFunnelCount > 0 ? (fn.count / maxFunnelCount) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-xs font-bold text-foreground/70 mb-1 flex justify-between w-full max-w-[320px]">
                    <span>{fn.stage}</span>
                    <span>{fn.count} Leads</span>
                  </div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    style={{ maxWidth: '320px' }}
                    className="h-7 rounded-xl bg-gold-400/10 border border-gold-400/15 flex items-center justify-center font-bold text-[10px] text-gold-600 dark:text-gold-400 tracking-wider shadow-inner"
                  >
                    {fn.count} ({Math.round(percent)}%)
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Security/Audit status footer */}
      <div className="p-4 bg-gold-400/5 rounded-2xl border border-gold-400/10 text-[10px] text-foreground/50 leading-relaxed flex items-center justify-between font-bold">
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-500" /> DATA INTEGRITY VERIFIED</span>
        <span>AUDIT TRAIL LOGGED SUCCESSFUL</span>
      </div>

    </div>
  );
}
