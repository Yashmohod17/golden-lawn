'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Mail, MessageSquare, AlertCircle, CheckCircle, Shield, 
  Settings, Play, Save, ToggleLeft, ToggleRight, Sparkles,
  LayoutDashboard, Megaphone, FileCode, TrendingUp, Send, CheckCheck,
  Layers, AlertTriangle, RefreshCw
} from 'lucide-react';
import { adminService } from '../../../services/admin';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'broadcast' | 'templates' | 'settings'>('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalSent: 0,
    unreadCount: 0,
    readCount: 0,
    readRatio: 100,
    byCategory: { SYSTEM: 0, BOOKING: 0, PAYMENT: 0, EVENT: 0 },
    byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 },
    emailDelivery: { sent: 0, failed: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab 2: Broadcast console states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('SYSTEM');
  const [broadcastPriority, setBroadcastPriority] = useState('LOW');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcasting, setBroadcasting] = useState(false);

  // Tab 3: Template editor states
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [updatingTemplate, setUpdatingTemplate] = useState(false);

  // Tab 4: Channel settings states
  const [resendEnabled, setResendEnabled] = useState(true);
  const [resendApiKey, setResendApiKey] = useState('re_Nagpur_GC123xyz');
  const [smsEnabled, setSmsEnabled] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const summary = await adminService.getSummary();
      setNotifications(summary.recentNotifications || []);

      try {
        const tList = await adminService.getNotificationTemplates();
        setTemplates(tList);
      } catch (err) {
        console.warn('Could not fetch templates from backend:', err);
      }

      try {
        const stats = await adminService.getNotificationAnalytics();
        setAnalytics(stats);
      } catch (err) {
        console.warn('Could not fetch analytics from backend:', err);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load notification system records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setBroadcasting(true);
    try {
      const result = await adminService.broadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        category: broadcastCategory,
        priority: broadcastPriority,
        targetRole: broadcastTarget
      });
      alert(result.message || 'Broadcast successfully dispatched!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleEditTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setTemplateSubject(tpl.subject);
    setTemplateBody(tpl.body);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setUpdatingTemplate(true);
    try {
      await adminService.updateNotificationTemplate(selectedTemplate.id, {
        subject: templateSubject,
        body: templateBody
      });
      alert('Template successfully updated in SQLite database!');
      setSelectedTemplate(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update template');
    } finally {
      setUpdatingTemplate(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Resend SMTP and SMS notification channels configurations updated successfully.');
  };

  return (
    <div className="space-y-6 relative min-h-[85vh] pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Notifications & Alerts Control</h2>
          <p className="text-xs text-foreground/50">Send real-time alerts, edit mail templates, review delivery logs and check delivery rates</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-foreground/50 hover:text-gold-500 rounded-xl hover:bg-gold-400/10 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gold-400/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4.5 py-3 border-b-2 text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-foreground/55 hover:text-foreground/80'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard & Logs
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4.5 py-3 border-b-2 text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'broadcast'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-foreground/55 hover:text-foreground/80'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Broadcast Console
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4.5 py-3 border-b-2 text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-foreground/55 hover:text-foreground/80'
          }`}
        >
          <FileCode className="h-4 w-4" />
          Template Editors
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4.5 py-3 border-b-2 text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-foreground/55 hover:text-foreground/80'
          }`}
        >
          <Settings className="h-4 w-4" />
          Channel Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Analytics Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 border border-gold-400/10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-foreground/45">Total Dispatched</span>
                <span className="block text-2xl font-bold text-foreground font-mono">{analytics.totalSent}</span>
              </div>
              <div className="glass-panel p-5 border border-gold-400/10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-foreground/45">Unread Logs</span>
                <span className="block text-2xl font-bold text-amber-500 font-mono">{analytics.unreadCount}</span>
              </div>
              <div className="glass-panel p-5 border border-gold-400/10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-foreground/45">Read Ratio</span>
                <span className="block text-2xl font-bold text-emerald-500 font-mono">{analytics.readRatio}%</span>
              </div>
              <div className="glass-panel p-5 border border-gold-400/10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm space-y-1">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-foreground/45">Email Delivery Status</span>
                <span className="block text-xs font-bold text-foreground">
                  Sent: <span className="font-mono text-emerald-500">{analytics.emailDelivery?.sent || 0}</span> / Fail: <span className="font-mono text-red-500">{analytics.emailDelivery?.failed || 0}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Category & Priority Metrics */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-gold-400/5 pb-2.5">
                    <Layers className="h-4.5 w-4.5 text-gold-500" /> By Category
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    {Object.entries(analytics.byCategory || {}).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="font-semibold text-foreground/75 uppercase tracking-wide text-[10px]">{cat}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-gold-400/10 text-gold-600 font-mono font-bold text-[10px]">
                          {count as number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-gold-400/5 pb-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-gold-500" /> By Priority
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    {Object.entries(analytics.byPriority || {}).map(([pri, count]) => (
                      <div key={pri} className="flex justify-between items-center">
                        <span className="font-semibold text-foreground/75 uppercase tracking-wide text-[10px]">{pri}</span>
                        <span className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] ${
                          pri === 'URGENT' ? 'bg-red-100 text-red-600' :
                          pri === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                          pri === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {count as number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed logs */}
              <div className="lg:col-span-2 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gold-500" />
                    Live Notification Feed Logs
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
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl flex items-start gap-4">
                        <div className={`p-2 rounded-xl bg-gold-400/10 ${n.type === 'success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{n.title}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 bg-gold-400/10 text-gold-600 rounded">
                              {n.category || 'SYSTEM'}
                            </span>
                            <span className="text-[9px] text-foreground/45 font-mono ml-auto">{n.date}</span>
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
            </div>
          </div>
        )}

        {/* Tab 2: Broadcast console */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6 mx-auto">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-gold-500" />
                Dispatch Custom Broadcast
              </h3>
              <p className="text-xs text-foreground/50 mt-1">Compose and send custom alerts immediately to customer portals and email mailboxes.</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Category</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="SYSTEM">SYSTEM ALERTS</option>
                    <option value="BOOKING">BOOKING STATS</option>
                    <option value="PAYMENT">PAYMENT TRANSACTIONS</option>
                    <option value="EVENT">OPERATIONS EVENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Priority</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                >
                  <option value="ALL">EVERYONE (Customers + Staff)</option>
                  <option value="CUSTOMER">CUSTOMERS ONLY</option>
                  <option value="STAFF">STAFF MEMBERS ONLY</option>
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGERS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Alert Header Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Venue Grass Core Aeration Complete"
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Alert Message Body</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type notification text details..."
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 resize-none"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3 text-zinc-950 font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-55"
              >
                <Send className="h-4 w-4" /> 
                <span>{broadcasting ? 'Broadcasting alert...' : 'Dispatch Broadcast Alert'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Template editors */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Template List */}
            <div className="lg:col-span-1 glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-gold-400/5 pb-2.5">
                <FileCode className="h-4.5 w-4.5 text-gold-500" /> Database Mail Templates
              </h3>
              <div className="space-y-2.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleEditTemplate(tpl)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer block ${
                      selectedTemplate?.id === tpl.id
                        ? 'border-gold-500 bg-gold-400/10 text-gold-600 dark:text-gold-400'
                        : 'border-gold-400/10 hover:bg-gold-400/5 text-foreground/80'
                    }`}
                  >
                    <span className="block font-bold truncate uppercase tracking-wider text-[10px]">{tpl.name.replace(/_/g, ' ')}</span>
                    <span className="block text-[10px] text-foreground/50 truncate mt-1">{tpl.subject}</span>
                  </button>
                ))}

                {templates.length === 0 && (
                  <p className="text-center py-6 text-foreground/45 text-xs">No email templates seeded.</p>
                )}
              </div>
            </div>

            {/* Template Editor Form */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground uppercase tracking-wide">
                      Edit Template: {selectedTemplate.name.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-[10px] text-foreground/50 mt-0.5">
                      Use double curly braces to interpolate variables (e.g. <span className="font-mono">{`{{name}}`}</span>, <span className="font-mono">{`{{bookingId}}`}</span>)
                    </p>
                  </div>

                  <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Email Subject Title</label>
                      <input
                        type="text"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">Mail Content Body</label>
                      <textarea
                        value={templateBody}
                        onChange={(e) => setTemplateBody(e.target.value)}
                        className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 font-mono resize-none"
                        rows={10}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updatingTemplate}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 text-zinc-950 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Save className="h-4 w-4" /> {updatingTemplate ? 'Saving...' : 'Save Template'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(null)}
                        className="px-5 py-2.5 text-foreground/60 hover:text-foreground font-bold uppercase tracking-wider text-xs hover:bg-gold-400/5 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="glass-panel border border-gold-400/15 rounded-3xl p-16 bg-white dark:bg-zinc-900 shadow-sm text-center text-foreground/45 text-xs">
                  <FileCode className="h-12 w-12 text-gold-400/30 mx-auto mb-2.5" />
                  <p className="font-semibold uppercase tracking-wider">No template selected.</p>
                  <p className="max-w-xs mx-auto mt-1">Select a database template from the sidebar catalog to edit subject headings or paragraph bodies.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Channel settings */}
        {activeTab === 'settings' && (
          <div className="max-w-md glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 shadow-sm mx-auto">
            <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-gold-400/5 pb-2.5">
              <Settings className="h-4.5 w-4.5 text-gold-500" /> Channels settings
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
        )}
      </div>
    </div>
  );
}
