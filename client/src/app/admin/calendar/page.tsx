'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, AlertTriangle, CheckCircle, 
  Clock, X, Lock, Unlock, Sparkles, AlertCircle, Info 
} from 'lucide-react';
import { adminService } from '../../../services/admin';
import { useAdmin } from '../../../lib/AdminContext';

export default function AvailabilityCalendarPage() {
  const { adminUser } = useAdmin();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Default to Nov 2026 for seeded data visibility
  const [calendarData, setCalendarData] = useState<{ events: any[]; blocked: any[] }>({ events: [], blocked: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date Blocking forms
  const [blockDateStr, setBlockDateStr] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: string; events: any[]; block: any | null } | null>(null);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError('');
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}-${month}`;
      
      const data = await adminService.getCalendar(yearMonth);
      setCalendarData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sync lawn availability calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  // Calendar grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray: Array<{ day: number | null; dateString: string }> = [];
  
  // Padding from previous month
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ day: null, dateString: '' });
  }

  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dayStr = String(d).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    daysArray.push({
      day: d,
      dateString: `${year}-${mStr}-${dayStr}`
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayInfo(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayInfo(null);
  };

  const handleDayClick = (dayStr: string) => {
    if (!dayStr) return;
    const dayEvents = calendarData.events.filter(e => e.startDate === dayStr);
    const dayBlock = calendarData.blocked.find(b => b.date === dayStr);
    setSelectedDayInfo({
      date: dayStr,
      events: dayEvents,
      block: dayBlock || null
    });
    // Set block input defaults
    setBlockDateStr(dayStr);
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateStr || !blockReason.trim()) return;

    setSubmittingBlock(true);
    setError('');
    try {
      await adminService.blockDate(blockDateStr, blockReason);
      setBlockReason('');
      await loadCalendarData();
      // Re-trigger details inspector if open
      handleDayClick(blockDateStr);
    } catch (err: any) {
      setError(err.message || 'Failed to apply date block constraint.');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleUnblockDate = async (dateStr: string) => {
    if (!window.confirm(`Release block constraint on ${dateStr}?`)) return;
    setError('');
    try {
      await adminService.unblockDate(dateStr);
      await loadCalendarData();
      handleDayClick(dateStr);
    } catch (err: any) {
      setError(err.message || 'Failed to release block constraint.');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Occupancy & Availability</h2>
          <p className="text-xs text-foreground/50">Schedule blocks, check booked events, and review property maintenance slots</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Calendar Grid Box */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gold-400/15 shadow-md space-y-6">
          
          {/* Calendar Navigation header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold-500" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                {monthNames[month]} {year}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-gold-400/15 rounded-xl hover:border-gold-400 hover:text-gold-500 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border border-gold-400/15 rounded-xl hover:border-gold-400 hover:text-gold-500 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-foreground/45 border-b border-gold-400/10 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center text-xs text-foreground/50">
              <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mr-2" />
              Loading lawn schedule...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {daysArray.map((dayItem, idx) => {
                if (!dayItem.day) {
                  return <div key={idx} className="h-14 bg-transparent" />;
                }
                
                const dateStr = dayItem.dateString;
                const isBlocked = calendarData.blocked.some(b => b.date === dateStr);
                const dayEventsList = calendarData.events.filter(e => e.startDate === dateStr);
                const isConfirmed = dayEventsList.some(e => e.color === 'emerald');
                const isPending = dayEventsList.some(e => e.color === 'amber');
                const isSelected = selectedDayInfo?.date === dateStr;

                let tileBg = 'bg-ivory-50/40 hover:bg-gold-400/5 text-foreground';
                let dotColor = '';

                if (isBlocked) {
                  tileBg = 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20';
                  dotColor = 'bg-red-500 animate-ping';
                } else if (isConfirmed) {
                  tileBg = 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20';
                  dotColor = 'bg-emerald-500';
                } else if (isPending) {
                  tileBg = 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20';
                  dotColor = 'bg-amber-500';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(dateStr)}
                    className={`h-14 p-2 rounded-xl flex flex-col justify-between items-start transition-all relative ${tileBg} ${
                      isSelected ? 'ring-2 ring-gold-500 border-transparent shadow-inner' : 'border border-gold-400/5'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{dayItem.day}</span>
                    {dotColor && (
                      <div className="flex gap-1 items-center self-end">
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                        {dayEventsList.length > 1 && (
                          <span className="text-[7px] font-bold text-foreground/50">{dayEventsList.length}x</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Color Guides */}
          <div className="flex gap-4 pt-4 border-t border-gold-400/10 text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500/25 border border-emerald-500/30" />
              <span>Confirmed Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-amber-500/25 border border-amber-500/30" />
              <span>Pending Inquiry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-red-500/25 border border-red-500/30" />
              <span>Blocked Date</span>
            </div>
          </div>
        </div>

        {/* Action Panel / Inspector Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <AnimatePresence mode="wait">
            {selectedDayInfo ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel border border-gold-400/20 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-gold-400/10 pb-3">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-foreground">Day Inspector</h3>
                    <p className="text-[9px] text-foreground/45 font-mono">{selectedDayInfo.date}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedDayInfo(null)}
                    className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 hover:text-gold-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Day status indicator */}
                <div className="text-xs">
                  {selectedDayInfo.block ? (
                    <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>SLOT IS BLOCKED</span>
                      </div>
                      <p className="text-foreground/75 leading-relaxed italic">&quot;{selectedDayInfo.block.reason}&quot;</p>
                      <div className="text-[9px] text-foreground/45">Blocked By: {selectedDayInfo.block.blockedBy}</div>
                      <button
                        onClick={() => handleUnblockDate(selectedDayInfo.date)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-500/5 py-2 text-[10px] font-bold text-red-500 uppercase cursor-pointer"
                      >
                        <Unlock className="h-3.5 w-3.5" /> Release Block
                      </button>
                    </div>
                  ) : selectedDayInfo.events.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDayInfo.events.map((ev) => (
                        <div 
                          key={ev.id} 
                          className={`p-3.5 rounded-xl border space-y-2 ${
                            ev.color === 'emerald' 
                              ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-800 dark:text-emerald-400' 
                              : 'bg-amber-500/5 border-amber-500/15 text-amber-800 dark:text-amber-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            {ev.color === 'emerald' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
                            <span className="truncate max-w-[170px]">{ev.title}</span>
                          </div>
                          {ev.description && <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">{ev.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>SLOT IS AVAILABLE</span>
                      </div>
                      <p className="text-[11px] text-foreground/60 leading-relaxed">No weddings, galas, or property maintenance reservations scheduled on this date.</p>
                      
                      {/* Block form */}
                      <form onSubmit={handleBlockDate} className="space-y-2 border-t border-emerald-500/10 pt-3">
                        <span className="block text-[9px] font-bold text-foreground/50 uppercase tracking-wider">Configure Lawn Maintenance Block</span>
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="Reason: e.g. Grass aerating, private event..."
                          className="w-full rounded-lg border border-gold-400/15 bg-white dark:bg-zinc-950 px-2.5 py-2 text-[11px] text-foreground outline-none focus:border-gold-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={submittingBlock}
                          className="w-full flex items-center justify-center gap-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-zinc-950 py-2 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Lock className="h-3.5 w-3.5" /> Lock Lawn Date
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/40 flex flex-col justify-center items-center h-[30vh]">
                <Info className="h-8 w-8 text-gold-400/30 mb-2" />
                <h4 className="font-serif font-bold text-foreground/70 mb-1">Calendar Details</h4>
                <p className="text-[10px] max-w-[200px]">Click on any cell inside the monthly scheduler to review details or block out slots.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
