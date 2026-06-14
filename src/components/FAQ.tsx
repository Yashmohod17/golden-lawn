'use client';

import React from 'react';
import { CustomAccordion } from './ui/CustomAccordion';

const faqItems = [
  {
    id: 'booking',
    title: 'What is the booking process for the lawn?',
    content: 'Booking is simple: Select an available date on our Calendar Checker or submit an Inquiry Form. A coordinator will lock the date temporarily and call you to arrange a site visit. A 25% advance payment is required to confirm the booking officially.',
  },
  {
    id: 'capacity',
    title: 'What is the venue guest capacity?',
    content: 'The Golden Celebrations Lawn can accommodate up to 2,000 guests for open-air lawn events. For smaller, intimate celebrations, we can structure partition layouts to fit 150-300 guests comfortably.',
  },
  {
    id: 'parking',
    title: 'Is there parking availability?',
    content: 'Yes! We have an adjacent private parking area that fits over 300 vehicles securely. We also provide professional valet assistance for all major weddings and corporate functions at no extra cost.',
  },
  {
    id: 'catering',
    title: 'Do you provide catering, or can we hire external caterers?',
    content: 'We offer premium, multi-cuisine catering packages. However, you are welcome to hire external, government-approved catering teams. Access to our fully equipped base kitchen is provided.',
  },
  {
    id: 'decoration',
    title: 'Can we customize decorations?',
    content: 'Absolutely! Our in-house decor designers work with you to customize themes, floral structures, lighting systems, and stage layouts. If you prefer, we also allow pre-approved external decorators.',
  },
  {
    id: 'timings',
    title: 'What are the event slot timings?',
    content: 'Our default time slots are Morning (7:00 AM - 3:00 PM) and Evening (6:00 PM - 2:00 AM). Extended timing options can be scheduled upon coordinator review.',
  },
  {
    id: 'cancellation',
    title: 'What is the cancellation and rescheduling policy?',
    content: 'Cancellations made 90 days prior to the event are eligible for a 50% refund of the advance deposit. Deposits are fully transferable to any available date within the same calendar year if requested 30 days prior.',
  },
];

export function FAQ() {
  return (
    <section id="faqs" className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-50 dark:bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Have Questions?
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Accordion list */}
        <CustomAccordion items={faqItems} />
      </div>
    </section>
  );
}
