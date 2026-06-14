import React from 'react';
import { Hero } from '../components/Hero';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { EventCategories } from '../components/EventCategories';
import { StatsSection } from '../components/StatsSection';
import { TourSection } from '../components/TourSection';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';

export default function Home() {
  return (
    <div className="w-full">
      {/* Cinematic Banner */}
      <Hero />

      {/* Amenity Cards */}
      <WhyChooseUs />

      {/* Category Grid */}
      <EventCategories />

      {/* Counters */}
      <StatsSection />

      {/* Virtual Drone Tour */}
      <TourSection />

      {/* Client Carousel */}
      <Testimonials />

      {/* Accordion FAQ */}
      <FAQ />
    </div>
  );
}
