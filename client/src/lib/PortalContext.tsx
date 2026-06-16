'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface PortalUser {
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  avatar: string;
  cateringPref: string;
  themePref: string;
  contactPref: string;
}

export interface BookingMilestone {
  label: string;
  date?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED';
}

export interface PortalBooking {
  id: string;
  date: string;
  eventType: string;
  package: string;
  cost: number;
  paid: number;
  pending: number;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  notes: string;
  location: string;
  coordinatorName: string;
  coordinatorPhone: string;
  milestones: BookingMilestone[];
}

export interface PortalPayment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  date: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  description: string;
  paymentType?: string;
  paymentStatus?: string;
  booking?: {
    eventType: string;
  };
}

export interface PortalNotification {
  id: string;
  date: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

interface PortalContextType {
  user: PortalUser | null;
  bookings: PortalBooking[];
  payments: PortalPayment[];
  invoices: any[];
  notifications: PortalNotification[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedUser: Partial<PortalUser>) => void;
  cancelBooking: (bookingId: string) => void;
  makePayment: (bookingId: string, amount: number, method: string) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshData: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateBooking: (bookingId: string, updatedFields: Partial<PortalBooking>) => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [bookings, setBookings] = useState<PortalBooking[]>([]);
  const [payments, setPayments] = useState<PortalPayment[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to construct headers with optional Bearer JWT token
  const getHeaders = (customerId: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-customer-id': customerId,
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('portal_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  // Helper: fetch all portal details for a specific customer
  const fetchPortalData = async (customerId: string) => {
    try {
      const headers = getHeaders(customerId);

      const [profileRes, bookingsRes, paymentsRes, notificationsRes, invoicesRes] = await Promise.all([
        fetch('/api/portal/profile', { headers }),
        fetch('/api/portal/bookings', { headers }),
        fetch('/api/portal/payments', { headers }),
        fetch('/api/portal/notifications', { headers }),
        fetch('/api/portal/invoices', { headers }),
      ]);

      // Detect expired or invalid sessions
      if (profileRes.status === 401 || profileRes.status === 403) {
        console.warn('Session expired or unauthorized. Logging out...');
        logout();
        return;
      }

      if (profileRes.ok && bookingsRes.ok && paymentsRes.ok && notificationsRes.ok && invoicesRes.ok) {
        const profileData = await profileRes.json();
        let bookingsData = await bookingsRes.json();
        const paymentsData = await paymentsRes.json();
        const notificationsData = await notificationsRes.json();
        const invoicesData = await invoicesRes.json();

        // Apply localStorage overrides for demo editing/status updates
        if (typeof window !== 'undefined') {
          const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
          bookingsData = bookingsData.map((b: any) => {
            if (overrides[b.id]) {
              const merged = { ...b, ...overrides[b.id] };
              merged.pending = Math.max(0, merged.cost - merged.paid);
              return merged;
            }
            return b;
          });
        }

        setUser(profileData);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setNotifications(notificationsData);
        setInvoices(invoicesData);
      } else {
        console.warn('Failed to load portal resources from Express API');
      }
    } catch (err) {
      console.warn('Server sync error:', err);
    }
  };

  const refreshData = async () => {
    if (typeof window !== 'undefined') {
      const customerId = localStorage.getItem('portal_customer_id') || 'cust-rajesh';
      await fetchPortalData(customerId);
    }
  };

  // Synchronize from database on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('portal_auth') === 'true';
      const customerId = localStorage.getItem('portal_customer_id') || 'cust-rajesh';
      setIsAuthenticated(storedAuth);

      if (storedAuth) {
        setIsLoading(true);
        fetchPortalData(customerId).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Listen to browser custom event for decoupled updates (e.g. from InquiryModal)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBookingCreated = async () => {
      const customerId = localStorage.getItem('portal_customer_id') || 'cust-rajesh';
      await fetchPortalData(customerId);
    };

    window.addEventListener('booking-created', handleBookingCreated);
    return () => {
      window.removeEventListener('booking-created', handleBookingCreated);
    };
  }, []);

  // WebSocket connection & fallback polling for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    let ws: WebSocket | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const token = typeof window !== 'undefined' ? localStorage.getItem('portal_access_token') : null;
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';

    const connectWS = () => {
      if (!token) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const isDevHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '4000';
      const host = isDevHost ? '127.0.0.1:5000' : window.location.host;
      const wsUrl = `${protocol}//${host}/?token=${token}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Portal real-time notifications connected');
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'NOTIFICATION') {
              // Prepend new notification to the notifications state
              setNotifications((prev) => [payload.data, ...prev]);
            }
          } catch (err) {
            console.warn('WS parse error:', err);
          }
        };

        ws.onclose = () => {
          console.log('WS connection closed. Fallback to HTTP polling.');
          startPolling();
          reconnectTimeout = setTimeout(() => {
            connectWS();
          }, 5000);
        };

        ws.onerror = (err) => {
          console.warn('WS connection error:', err);
          ws?.close();
        };
      } catch (err) {
        console.warn('Failed to create WebSocket client:', err);
        startPolling();
      }
    };

    const startPolling = () => {
      if (pollInterval) return;
      pollInterval = setInterval(() => {
        console.log('Polling notifications via HTTP fallback...');
        fetchPortalData(customerId);
      }, 10000);
    };

    connectWS();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (pollInterval) clearInterval(pollInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const normalizedUser = username.trim().toLowerCase();
      const email = normalizedUser === 'rajesh' ? 'rajesh.kumar@gmail.com' : normalizedUser;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      if (data && data.accessToken && data.user) {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('portal_auth', 'true');
          localStorage.setItem('portal_customer_id', data.user.id);
          localStorage.setItem('portal_access_token', data.accessToken);
          localStorage.setItem('portal_refresh_token', data.refreshToken);
        }
        setIsLoading(true);
        await fetchPortalData(data.user.id);
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setBookings([]);
    setPayments([]);
    setInvoices([]);
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portal_auth');
      localStorage.removeItem('portal_customer_id');
      localStorage.removeItem('portal_access_token');
      localStorage.removeItem('portal_refresh_token');
      localStorage.removeItem('portal_booking_overrides');
    }
  }, []);

  // Proactive auto-logout after 15 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in ms

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Portal inactivity timeout reached. Logging out...');
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

  const updateProfile = async (updatedUser: Partial<PortalUser>) => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: getHeaders(customerId),
        body: JSON.stringify(updatedUser),
      });
      if (res.ok) {
        await fetchPortalData(customerId);
      }
    } catch (err) {
      console.error('Failed to update profile settings:', err);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      // Direct update in booking status
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      
      if (res.ok) {
        // Clear override for this booking since backend has successfully persisted the cancellation
        if (typeof window !== 'undefined') {
          const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
          delete overrides[bookingId];
          localStorage.setItem('portal_booking_overrides', JSON.stringify(overrides));
        }
      } else {
        // Persist status change in overrides so it stays cancelled even if backend reset occurs or doesn't persist properly
        if (typeof window !== 'undefined') {
          const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
          overrides[bookingId] = {
            ...(overrides[bookingId] || {}),
            status: 'CANCELLED',
          };
          localStorage.setItem('portal_booking_overrides', JSON.stringify(overrides));
        }
      }

      await fetchPortalData(customerId);
    } catch (err) {
      console.error('Failed to cancel booking request:', err);
    }
  };

  const updateBooking = async (bookingId: string, updatedFields: Partial<PortalBooking>) => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getHeaders(customerId),
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        // Clear override for this booking since backend has successfully persisted the updates
        if (typeof window !== 'undefined') {
          const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
          delete overrides[bookingId];
          localStorage.setItem('portal_booking_overrides', JSON.stringify(overrides));
        }
        await fetchPortalData(customerId);
      } else {
        // Fallback to local state update and overrides if server update failed
        updateLocalBookingStateAndOverrides(bookingId, updatedFields);
      }
    } catch (err) {
      console.error('Failed to update booking on server:', err);
      updateLocalBookingStateAndOverrides(bookingId, updatedFields);
    }
  };

  const updateLocalBookingStateAndOverrides = (bookingId: string, updatedFields: Partial<PortalBooking>) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const merged = { ...b, ...updatedFields };
          merged.pending = Math.max(0, merged.cost - merged.paid);
          return merged;
        }
        return b;
      })
    );

    if (typeof window !== 'undefined') {
      const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
      overrides[bookingId] = {
        ...(overrides[bookingId] || {}),
        ...updatedFields,
      };
      localStorage.setItem('portal_booking_overrides', JSON.stringify(overrides));
    }
  };

  const makePayment = async (
    bookingId: string,
    amount: number,
    method: string
  ): Promise<boolean> => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch('/api/portal/payments/simulate', {
        method: 'POST',
        headers: getHeaders(customerId),
        body: JSON.stringify({ bookingId, amount, method }),
      });
      if (res.ok) {
        // Clear override for this booking since payment is processed and database is updated
        if (typeof window !== 'undefined') {
          const overrides = JSON.parse(localStorage.getItem('portal_booking_overrides') || '{}');
          delete overrides[bookingId];
          localStorage.setItem('portal_booking_overrides', JSON.stringify(overrides));
        }
        await fetchPortalData(customerId);
        return true;
      }
    } catch (err) {
      console.error('Failed to submit simulation payment transaction:', err);
    }
    return false;
  };

  const markNotificationRead = async (id: string) => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch(`/api/portal/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(customerId),
      });
      if (res.ok) {
        await fetchPortalData(customerId);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch('/api/portal/notifications/read-all', {
        method: 'POST',
        headers: getHeaders(customerId),
      });
      if (res.ok) {
        await fetchPortalData(customerId);
      }
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch(`/api/portal/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(customerId),
      });
      if (res.ok) {
        await fetchPortalData(customerId);
      }
    } catch (err) {
      console.error('Failed to delete notification card:', err);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('portal_customer_id') || 'cust-rajesh' : 'cust-rajesh';
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getHeaders(customerId),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      if (res.ok) {
        logout(); // Force login again for security since password changed
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update password' };
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      return { success: false, error: 'Network error or server unavailable' };
    }
  };

  return (
    <PortalContext.Provider
      value={{
        user,
        bookings,
        payments,
        invoices,
        notifications,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateProfile,
        cancelBooking,
        makePayment,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        refreshData,
        changePassword,
        updateBooking,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

const defaultContextValue: PortalContextType = {
  user: null,
  bookings: [],
  payments: [],
  invoices: [],
  notifications: [],
  isAuthenticated: false,
  isLoading: false,
  login: async () => false,
  logout: () => {},
  updateProfile: () => {},
  cancelBooking: () => {},
  makePayment: async () => false,
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  deleteNotification: () => {},
  refreshData: async () => {},
  changePassword: async () => ({ success: false, error: 'Not inside provider' }),
  updateBooking: async () => {},
};

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
