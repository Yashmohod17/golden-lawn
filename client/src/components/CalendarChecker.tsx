'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useInquiry } from '../lib/InquiryContext';

export function CalendarChecker() {
  const { openInquiry } = useInquiry();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // Start at June 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Deterministic random generator for dates
  const seed = (month + year) % 10;
  const bookedDates = [
    (seed * 3) % 28 || 4,
    (seed * 7) % 28 || 12,
    (seed * 11) % 28 || 18,
    (seed * 13) % 28 || 19,
    (seed * 17) % 28 || 24,
    (seed * 19) % 28 || 27,
    5, 6, 13, 14, 20, 21 // Always book weekends for simulation
  ].filter(day => day > 0 && day <= 31);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const isDayBooked = (day: number) => bookedDates.includes(day);

  const handleDateSelect = (day: number) => {
    if (isDayBooked(day)) return;
    setSelectedDay(day === selectedDay ? null : day);
  };

  const handleBookSelectedDate = () => {
    if (selectedDay === null) return;
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    openInquiry('', formattedDate);
  };

  return (
    <div className="rounded-3xl border border-gold-400/20 bg-ivory-100 p-6 shadow-xl dark:bg-zinc-950 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-500">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">
            Availability Checker
          </h3>
          <p className="text-xs text-foreground/60">Check open dates and lock your schedule</p>
        </div>
      </div>

      {/* Calendar Shell */}
      <div className="border border-gold-400/15 rounded-2xl overflow-hidden bg-ivory-50 dark:bg-zinc-900/40">
        
        {/* Calendar Nav Bar */}
        <div className="flex items-center justify-between p-4 bg-gold-400/5 border-b border-gold-400/10">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full text-foreground/80 hover:bg-gold-400/10 hover:text-gold-500"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h4 className="font-serif text-base font-bold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full text-foreground/80 hover:bg-gold-400/10 hover:text-gold-500"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Days of Week headers */}
        <div className="grid grid-cols-7 text-center py-2 bg-gold-400/5 font-sans text-xs font-semibold text-foreground/50 border-b border-gold-400/10">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
            <div key={idx} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 text-center p-2 gap-1.5 min-h-[16rem]">
          {/* Empty lead-in days */}
          {[...Array(firstDayIndex)].map((_, idx) => (
            <div key={`empty-${idx}`} className="py-2" />
          ))}

          {/* Days in Month */}
          {[...Array(daysInMonth)].map((_, idx) => {
            const dayNum = idx + 1;
            const booked = isDayBooked(dayNum);
            const selected = selectedDay === dayNum;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => handleDateSelect(dayNum)}
                disabled={booked}
                className={`py-3 text-xs font-medium rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  booked
                    ? 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800/20 dark:text-zinc-400 cursor-not-allowed'
                    : selected
                    ? 'bg-gold-400 text-zinc-950 font-bold shadow-md shadow-gold-400/20 scale-[1.05]'
                    : 'bg-white text-foreground hover:bg-gold-400/10 dark:bg-zinc-800 dark:text-zinc-200'
                }`}
              >
                <span>{dayNum}</span>
                {/* Micro Status Dot */}
                <span
                  className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${
                    booked ? 'bg-red-500/50' : selected ? 'bg-zinc-950' : 'bg-emerald-500/50'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & CTA */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Legend */}
        <div className="flex gap-4 text-[10px] justify-center text-foreground/70">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
            <span>Selected</span>
          </div>
        </div>

        {/* Selected date action */}
        {selectedDay !== null ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-emerald-400/5 p-4 rounded-2xl border border-emerald-400/20"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-foreground">Date is Available!</p>
                <p className="text-[10px] text-foreground/60">
                  {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
                </p>
              </div>
            </div>
            <button
              onClick={handleBookSelectedDate}
              className="rounded-xl bg-gold-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-gold-300"
            >
              Book Date
            </button>
          </motion.div>
        ) : (
          <div className="flex items-start gap-2.5 bg-gold-400/5 p-4 rounded-2xl border border-gold-400/10">
            <AlertCircle className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-foreground/60">
              Select an available date in the calendar grid to lock your booking inquiry for that date. Weekends have pre-scheduled events in this simulation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
