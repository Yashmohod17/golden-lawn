'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
);

export function Footer() {
  const { openInquiry } = useInquiry();

  return (
    <footer className="relative border-t border-gold-400/20 bg-ivory-100 dark:bg-zinc-950 pt-16 pb-8">
      {/* Absolute Decorative Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.03),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-widest text-foreground">
                GOLDEN
              </span>
              <span className="h-5 w-[1px] bg-gold-400" />
              <span className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">
                Celebrations
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-foreground/75 dark:text-foreground/60">
              Where Every Celebration Becomes a Golden Memory. Experience high-end weddings, receptions, and social gatherings in a venue designed for luxury.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
                { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
                { icon: YoutubeIcon, href: 'https://youtube.com', label: 'Youtube' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/20 text-foreground/70 transition-all hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-400"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold tracking-wider text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Packages', href: '/packages' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-foreground/75 hover:text-gold-400 transition-colors dark:text-foreground/60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold tracking-wider text-foreground">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-foreground/75 dark:text-foreground/60 leading-relaxed">
                  Golden Celebrations Lawn, Narsala Road, Near Hudkeshwar, Nagpur, MH - 440034
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-400 shrink-0" />
                <span className="text-foreground/75 dark:text-foreground/60">
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold-400 shrink-0" />
                <span className="text-foreground/75 dark:text-foreground/60">
                  info@goldencelebrations.com
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter/CTA */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold tracking-wider text-foreground">Plan Your Event</h4>
            <p className="text-sm leading-relaxed text-foreground/75 dark:text-foreground/60">
              Ready to create your golden memory? Let’s check custom packages and availability.
            </p>
            <button
              onClick={() => openInquiry()}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gold-400 text-gold-500 py-3 font-sans text-xs font-bold tracking-widest uppercase hover:bg-gold-400 hover:text-zinc-950 transition-all duration-300"
            >
              <Calendar className="h-4 w-4" />
              Inquire Availability
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gold-400/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-foreground/60 gap-4">
          <p>© {new Date().getFullYear()} The Golden Celebrations Lawn. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
