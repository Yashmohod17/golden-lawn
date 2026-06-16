'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, MailOpen, Sparkles, CheckCheck,
  Calendar, CreditCard, ShieldAlert, Layers,
  ListFilter 
} from 'lucide-react';
import { usePortal } from '../../../lib/PortalContext';

export default function CustomerNotifications() {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification 
  } = usePortal();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    const nCategory = n.category || 'SYSTEM';
    const nPriority = n.priority || 'LOW';
    
    const matchesCategory = filterCategory === 'ALL' || nCategory === filterCategory;
    const matchesPriority = filterPriority === 'ALL' || nPriority === filterPriority;
    
    return matchesCategory && matchesPriority;
  });

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'BOOKING':
        return <Calendar className="h-3.5 w-3.5" />;
      case 'PAYMENT':
        return <CreditCard className="h-3.5 w-3.5" />;
      case 'EVENT':
        return <Sparkles className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-600 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border-orange-200/50 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'bg-zinc-50 text-zinc-500 border-zinc-200/50 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800/50';
    }
  };

  const categories = ['ALL', 'BOOKING', 'PAYMENT', 'EVENT', 'SYSTEM'];
  const priorities = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            Notifications
          </h1>
          <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            Stay informed with real-time progress alerts and booking updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 rounded-xl border border-gold-400/25 bg-white dark:bg-zinc-900 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 hover:border-gold-400 transition-all cursor-pointer shadow-sm animate-pulse"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filters & Control Panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/40 dark:bg-zinc-900/40 border border-gold-400/10 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 mr-2 flex items-center gap-1">
            <Layers className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-transparent text-foreground/75 hover:bg-gold-400/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 mr-2 flex items-center gap-1">
            <ListFilter className="h-3 w-3" /> Priority:
          </span>
          {priorities.map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterPriority === pri
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-transparent text-foreground/75 hover:bg-gold-400/10'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Container */}
      <div className="max-w-3xl glass-panel rounded-3xl border border-gold-400/15 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex justify-between items-center border-b border-gold-400/5 pb-4">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Inbox Alert Log
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/50">
            {unreadCount} unread / {filteredNotifications.length} matching / {notifications.length} total
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((ntf) => (
              <motion.div
                key={ntf.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-2xl border flex items-start gap-4 transition-all relative ${
                  ntf.read 
                    ? 'border-gold-400/5 bg-white/20 dark:bg-zinc-900/20 opacity-70' 
                    : 'border-gold-400/25 bg-white dark:bg-zinc-900 shadow-sm'
                }`}
              >
                {!ntf.read && (
                  <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
                )}

                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  ntf.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : ntf.type === 'warning' 
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' 
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                }`}>
                  {ntf.type === 'success' ? (
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  ) : ntf.type === 'warning' ? (
                    <AlertCircle className="h-4.5 w-4.5" />
                  ) : (
                    <Info className="h-4.5 w-4.5" />
                  )}
                </div>

                <div className="space-y-2 w-full pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wide ${
                      !ntf.read ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-foreground'
                    }`}>
                      {ntf.title}
                    </h4>

                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-400/10 text-gold-600 border border-gold-400/20">
                      {getCategoryIcon(ntf.category)}
                      {ntf.category || 'SYSTEM'}
                    </span>

                    <span className={`inline-flex items-center text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityStyle(ntf.priority)}`}>
                      {ntf.priority || 'LOW'}
                    </span>
                  </div>
                  
                  <p className="text-[11px] leading-relaxed text-foreground/70">{ntf.message}</p>
                  <div className="text-[9px] text-foreground/45 font-mono">{ntf.date}</div>
                </div>

                <div className="absolute right-3.5 top-5 flex items-center gap-1.5">
                  {!ntf.read && (
                    <button
                      onClick={() => markNotificationRead(ntf.id)}
                      className="p-1.5 rounded hover:bg-gold-400/10 text-foreground/40 hover:text-gold-500 transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <MailOpen className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(ntf.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <div className="py-16 text-center text-xs text-foreground/40 space-y-3">
              <Bell className="h-10 w-10 text-gold-400 mx-auto opacity-50" />
              <h4 className="font-semibold text-foreground">No matching notifications</h4>
              <p className="max-w-xs mx-auto">
                There are no notifications matching your current filters. Adjust your Category or Priority selections to view other notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
