'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InquiryContextType {
  isOpen: boolean;
  selectedPackage: string;
  selectedDate: string;
  estimatedCost: number;
  openInquiry: (pkg?: string, date?: string, cost?: number) => void;
  closeInquiry: () => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);

  const openInquiry = (pkg = '', date = '', cost = 0) => {
    setSelectedPackage(pkg);
    setSelectedDate(date);
    setEstimatedCost(cost);
    setIsOpen(true);
  };

  const closeInquiry = () => {
    setIsOpen(false);
  };

  return (
    <InquiryContext.Provider
      value={{
        isOpen,
        selectedPackage,
        selectedDate,
        estimatedCost,
        openInquiry,
        closeInquiry,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
}
