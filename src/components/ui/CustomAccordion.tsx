'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: string | React.ReactNode;
}

interface CustomAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function CustomAccordion({ items, allowMultiple = false }: CustomAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-gold-400/20 bg-ivory-100/50 backdrop-blur-md transition-all duration-300 dark:border-gold-400/10 dark:bg-zinc-900/50 hover:border-gold-400/40"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between p-5 text-left font-serif text-lg font-medium text-foreground transition-colors hover:text-gold-400"
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-gold-400" />
              </motion.div>
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="border-t border-gold-400/10 p-5 text-base leading-relaxed text-foreground/80 dark:border-gold-400/5">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
