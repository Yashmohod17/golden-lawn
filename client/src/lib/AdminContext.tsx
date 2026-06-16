'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, AdminUser } from '../services/admin';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshAdminSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadSession = async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('admin_access_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AdminUser;
        setAdminUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse admin session user:', err);
        clearSession();
      }
    }
    setIsLoading(false);
  };

  const clearSession = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await adminService.login(email, password);
      
      if (data && data.accessToken && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_access_token', data.accessToken);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
        setAdminUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err) {
      console.error('Admin login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    clearSession();
    router.push('/admin/login');
  }, [router]);

  // Proactive auto-logout after 15 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in ms

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Admin console inactivity timeout reached. Logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events to monitor user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Set up listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);

  const hasPermission = (permissionName: string): boolean => {
    if (!adminUser) return false;
    
    // Owner role automatically bypasses all permission constraints
    if (adminUser.role?.name === 'OWNER') return true;

    // Check permissions array inside role
    const permissions = adminUser.role?.permissions || [];
    return permissions.some(p => p.name === permissionName);
  };

  const refreshAdminSession = async () => {
    await loadSession();
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
        refreshAdminSession,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
