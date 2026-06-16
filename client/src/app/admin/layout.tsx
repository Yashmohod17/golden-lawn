'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Calendar, CreditCard, FileText, UserCheck, 
  Target, Bell, BarChart3, Download, Settings, User, LogOut, 
  Menu, X, Sparkles, ChevronRight, CheckSquare
} from 'lucide-react';
import { AdminProvider, useAdmin } from '../../lib/AdminContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isAuthenticated, logout, isLoading, hasPermission } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';
  
  // Route security gate: redirect to admin/login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
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
        <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Synchronizing Admin Panel...</p>
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

  // Define navigation items with permission guards
  const allNavItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Customers', href: '/admin/customers', icon: Users, permission: 'read:bookings' },
    { label: 'Bookings', href: '/admin/bookings', icon: CheckSquare, permission: 'read:bookings' },
    { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, permission: 'read:payments' },
    { label: 'Invoices', href: '/admin/invoices', icon: FileText, permission: 'read:payments' },
    { label: 'Staffing', href: '/admin/staff', icon: UserCheck, permission: 'read:staff' },
    { label: 'CRM Leads', href: '/admin/crm', icon: Target, permission: 'read:crm' },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'read:analytics' },
    { label: 'Reports', href: '/admin/reports', icon: Download, permission: 'read:reports' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'manage:settings' },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ];

  // Filter items user has permission to see
  const navItems = allNavItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className="w-full min-h-[85vh] bg-ivory-50 dark:bg-zinc-950 flex flex-col lg:flex-row relative">
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-r border-gold-400/10 p-6 justify-between shadow-sm sticky top-16 h-[calc(100vh-64px)] z-20">
        <div className="space-y-6 flex-1 flex flex-col overflow-y-auto pr-1">
          
          {/* Brand/Console Label */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-gold-500 font-bold uppercase tracking-widest mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Management</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Golden Lawn Console
            </h2>
            <p className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase mt-0.5 tracking-wider">
              {adminUser?.role?.name || 'STAFF'} PORTAL
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.href === '/admin' 
                ? pathname === '/admin' 
                : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 border ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-400/10 to-gold-400/5 text-gold-600 dark:text-gold-400 border-gold-400/20 shadow-sm'
                      : 'text-foreground/75 border-transparent hover:border-gold-400/15 hover:bg-gold-400/5 hover:text-gold-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-gold-500' : 'text-foreground/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-gold-400' : 'text-foreground/30'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Log Out */}
        {adminUser && (
          <div className="border-t border-gold-400/10 pt-4 mt-4 space-y-4">
            <Link
              href="/admin/profile"
              className="flex items-center gap-3.5 group cursor-pointer hover:opacity-95"
            >
              <div className="h-10 w-10 rounded-full bg-gold-400/10 text-gold-500 flex items-center justify-center font-serif text-sm font-bold border border-gold-400/20 shadow-inner">
                {adminUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-foreground truncate group-hover:text-gold-500 transition-colors">
                  {adminUser.name}
                </h4>
                <p className="text-[10px] text-foreground/50 truncate">
                  {adminUser.email}
                </p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/10 hover:border-red-500 hover:bg-red-500/5 text-red-500 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
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
            {adminUser?.name.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Admin Console</h3>
            <p className="text-[9px] text-foreground/50">Role: {adminUser?.role?.name || 'STAFF'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile Shortcut */}
          <Link 
            href="/admin/profile" 
            className="p-2 text-foreground/80 hover:text-gold-400 transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground/80 hover:bg-gold-400/10 hover:text-gold-400 transition-colors"
            aria-label="Toggle Admin Menu"
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
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.href === '/admin' 
                  ? pathname === '/admin' 
                  : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-400/10 to-gold-400/5 text-gold-600 dark:text-gold-400 border-gold-400/20'
                        : 'text-foreground/75 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gold-500" />
                      <span>{item.label}</span>
                    </div>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
