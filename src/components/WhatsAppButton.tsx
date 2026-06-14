'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phoneNumber = '919876543210'; // Simulated contact number

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const encodedText = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(url, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-4 w-72 overflow-hidden rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#111B21] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#008069] dark:bg-[#202C33] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-serif text-xl font-bold">
                    G
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#008069] dark:border-[#202C33] bg-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Golden Celebrations</h4>
                  <p className="text-xs text-white/80">Online | Event Coordinator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-white/85 hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#E5DDD5] dark:bg-[#0B141A] h-36 overflow-y-auto flex flex-col justify-end">
              <div className="rounded-2xl rounded-tl-none bg-white dark:bg-[#202C33] p-3 text-sm text-black dark:text-[#E9EDEF] shadow-sm max-w-[85%] border border-emerald-500/10 dark:border-zinc-800">
                <p>Hello! Welcome to The Golden Celebrations Lawn. How can I help you plan your dream event today? 🌸</p>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-[#F0F2F5] dark:bg-[#1F2C34] border-t border-[#E9EDEF] dark:border-[#222E35] flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-zinc-200 dark:border-[#2A3942] bg-white dark:bg-[#2A3942] px-4 py-2 text-sm text-black dark:text-[#E9EDEF] outline-none transition-colors focus:border-emerald-600 focus:bg-white dark:focus:bg-[#2A3942]"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008069] dark:bg-[#00a884] text-white transition-opacity disabled:opacity-50 hover:bg-[#006E5A] dark:hover:bg-[#008f70]"
                aria-label="Send WhatsApp message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20BA5A] dark:bg-[#00a884] dark:hover:bg-[#008f70] text-white shadow-lg shadow-green-500/20 transition-all focus:outline-none z-50 animate-pulse-gold !animation-duration-[3s] relative"
        aria-label="Contact via WhatsApp"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
