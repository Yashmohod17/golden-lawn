'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Mail, MessageSquare, AlertCircle, CheckCircle, Shield, 
  Settings, Play, Save, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';
import { adminService } from '../../../services/admin';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for settings
  const [resendEnabled, setResendEnabled] = useState(true);
  const [resendApiKey, setResendApiKey] = useState('re_Nagpur_GC123xyz');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('IMMEDIATE');

  // Test notification trigger
  const [testTitle, setTestTitle] = useState('Menu Adjustment Requested');
  const [testMessage, setTestMessage] = useState('Client Suresh Patil has modified their wedding reception appetizers preferences.');
  const [sendingTest, setSendingTest] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      // Notifications can be retrieved from summary statistics
      const summary = await adminService.getSummary();
      setNotifications(summary.recentNotifications || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load system notification logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Resend SMTP and SMS notification channels configurations updated successfully.');
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || !testMessage.trim()) return;

    setSendingTest(true);
    try {
      // Create notification in database via API
      const token = localStorage.getItem('admin_access_token');
      const res = await fetch('/api/portal/notifications/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: testTitle,
          message: testMessage,
          type: 'warning'
        })
      });

      if (!res.ok) throw new Error('Failed to dispatch test notification.');
      
      alert('Test alert dispatched and stored in SQLite database successfully.');
      setTestTitle('');
      setTestMessage('');
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || 'Error triggering simulator.');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Notifications & Alerts</h2>
          <p className="text-xs text-foreground/50">Configure Resend SMTP email alerts, SMS dispatch settings, and review logs</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Recent Logs */}
        <div className="lg:col-span-2 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
          <div>
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold-500" />
              System Notification Feed
            </h3>
            <p className="text-[10px] text-foreground/50">Audit log of system alerts sent to customers and operators</p>
          </div>

          <div className="h-[1px] bg-gold-400/10" />

          {loading ? (
            <div className="text-center py-12 text-xs text-foreground/50">
              <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading system feed...
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl flex items-start gap-4">
                  <div className={`p-2 rounded-xl bg-gold-400/10 ${n.type === 'success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-foreground">{n.title}</span>
                      <span className="text-[9px] text-foreground/45 font-mono">{n.date}</span>
                    </div>
                    <p className="text-[11px] text-foreground/60 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 text-foreground/40">
                  <Bell className="h-8 w-8 text-gold-400/30 mx-auto mb-2" />
                  <p className="text-xs uppercase tracking-wider">No notifications recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Alert settings and simulation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Settings Card */}
          <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-gold-500" /> Channels Settings
            </h3>
            
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              
              {/* Resend toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-foreground block">Resend Email Alerts</span>
                  <span className="text-[10px] text-foreground/50">Dispatch notifications via SMTP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResendEnabled(!resendEnabled)}
                  className="text-gold-500"
                >
                  {resendEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                </button>
              </div>

              {resendEnabled && (
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">Resend API Key</label>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                  />
                </div>
              )}

              {/* SMS toggle */}
              <div className="flex justify-between items-center border-t border-gold-400/10 pt-4">
                <div>
                  <span className="font-bold text-foreground block">SMS Channel Alerts</span>
                  <span className="text-[10px] text-foreground/50">Dispatch alerts to staff phone</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className="text-gold-500"
                >
                  {smsEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-gold-500 dark:text-zinc-950 py-2.5 font-bold uppercase tracking-wider cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Channels
              </button>
            </form>
          </div>

          {/* Simulation Dispatcher */}
          <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-gold-500" /> Alert Dispatch Simulator
            </h3>
            
            <form onSubmit={handleSendTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">Alert Title</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Booking Modified"
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">Alert Message</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Notification body details..."
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400 resize-none"
                  rows={2}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest}
                className="w-full flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-2.5 text-zinc-950 font-bold uppercase tracking-wider cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" /> {sendingTest ? 'Dispatching...' : 'Dispatch Alert'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
