'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, CreditCard, Bell, User, LogOut, 
  Menu, X, Sparkles, ChevronRight 
} from 'lucide-react';
import { PortalProvider, usePortal } from '../../lib/PortalContext';

// Wrap the actual layout contents in a helper component that has access to PortalContext
function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, notifications, logout, isLoading } = usePortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/portal/login';
  
  // Route security gate: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/portal/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Handle body scroll locking on mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Synchronizing Portal...</p>
      </div>
    );
  }

  // If not logged in and not on login page, wait for redirect
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Redirecting to login...</p>
      </div>
    );
  }

  // Render Login page directly without sidebar/navs
  if (isLoginPage) {
    return <>{children}</>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { label: 'My Bookings', href: '/portal/bookings', icon: Calendar },
    { label: 'Payment History', href: '/portal/payments', icon: CreditCard },
    { 
      label: 'Notifications', 
      href: '/portal/notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { label: 'Profile', href: '/portal/profile', icon: User },
  ];

  return (
    <div className="w-full min-h-[85vh] bg-ivory-50 dark:bg-zinc-950 flex flex-col lg:flex-row relative">
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-r border-gold-400/10 p-6 justify-between shadow-sm sticky top-16 h-[calc(100vh-64px)] z-20">
        <div className="space-y-8">
          
          {/* Brand/Portal Label */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gold-500 font-bold uppercase tracking-widest mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Customer Account</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Rajesh&apos;s Console
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              // Active check: exact match for dashboard, startswith check for others (e.g. bookings details is under bookings)
              const isActive = item.href === '/portal' 
                ? pathname === '/portal' 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-400/10 to-gold-400/5 text-gold-600 dark:text-gold-400 border-gold-400/20 shadow-sm'
                      : 'text-foreground/70 border-transparent hover:border-gold-400/15 hover:bg-gold-400/5 hover:text-gold-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-gold-500' : 'text-foreground/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined ? (
                    <span className="bg-burgundy-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-gold-400' : 'text-foreground/30'}`} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Log Out */}
        {user && (
          <div className="border-t border-gold-400/10 pt-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-full bg-gold-400/10 text-gold-500 flex items-center justify-center font-serif text-sm font-bold border border-gold-400/20 shadow-inner">
                {user.avatar}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-foreground truncate">{user.name}</h4>
                <p className="text-[10px] text-foreground/50 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/10 hover:border-red-500 hover:bg-red-500/5 text-red-500 py-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden w-full bg-white dark:bg-zinc-900 border-b border-gold-400/10 px-4 py-3 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gold-400/10 text-gold-500 flex items-center justify-center font-serif text-xs font-bold border border-gold-400/25">
            {user?.avatar}
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Customer Portal</h3>
            <p className="text-[9px] text-foreground/50">Welcome, Rajesh</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Shortcut */}
          <Link 
            href="/portal/notifications" 
            className="relative p-2 text-foreground/80 hover:text-gold-400 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-burgundy-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground/80 hover:bg-gold-400/10 hover:text-gold-400 transition-colors"
            aria-label="Toggle Portal Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-b border-gold-400/10 bg-white dark:bg-zinc-900 px-4 pt-2 pb-6 shadow-xl overflow-hidden z-20 absolute w-full left-0 top-[57px]"
          >
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item) => {
                const isActive = item.href === '/portal' 
                  ? pathname === '/portal' 
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-400/10 to-gold-400/5 text-gold-600 dark:text-gold-400 border-gold-400/20'
                        : 'text-foreground/75 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gold-500" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-burgundy-600 text-white rounded-full px-2 py-0.5 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="h-[1px] bg-gold-400/10 my-2" />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </PortalProvider>
  );
}
