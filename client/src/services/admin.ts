const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to construct headers with the admin authorization token
export function getAdminHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Array<{ id: string; name: string }>;
  } | null;
}

export interface DashboardSummary {
  totalBookings: number;
  upcomingEvents: any[];
  monthlyRevenue: number;
  pendingPayments: number;
  activeCustomers: number;
  occupancyRate: number;
  recentBookings: any[];
  recentNotifications: any[];
}

export interface CustomerNote {
  id: string;
  note: string;
  authorName: string;
  createdAt: string;
}

export interface CustomerDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  avatar: string;
  cateringPref?: string;
  themePref?: string;
  contactPref?: string;
  bookings: any[];
  notes: CustomerNote[];
  documents: CustomerDocument[];
}

export interface CalendarData {
  events: any[];
  blocked: any[];
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'OVERDUE';
  createdAt: string;
  booking?: {
    eventType: string;
    name: string;
  };
}

export interface StaffMember {
  id: string;
  userId: string;
  role: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  salary?: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedToId?: string;
  createdById: string;
  assignedTo?: {
    user: {
      name: string;
    };
  };
  createdBy: {
    user: {
      name: string;
    };
  };
}

export interface CRMLead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON';
  notes?: string;
  createdAt: string;
  inquiries: CRMInquiry[];
}

export interface CRMInquiry {
  id: string;
  leadId: string;
  eventType: string;
  eventDate: string;
  guests: number;
  notes?: string;
  status: 'OPEN' | 'CONVERTED' | 'CLOSED';
  followUps: CRMFollowUp[];
  createdAt: string;
}

export interface CRMFollowUp {
  id: string;
  inquiryId: string;
  date: string;
  notes: string;
  outcome?: string;
  nextAction?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  createdAt: string;
}

export const adminService = {
  // 1. Authentication
  async login(email: string, password: string): Promise<{ accessToken: string; user: AdminUser }> {
    const res = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  // 2. Dashboard Summary
  async getSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_URL}/api/admin/summary`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  // 3. Customers
  async getCustomers(search = '', filter = 'ALL'): Promise<any[]> {
    const params = new URLSearchParams({ search, filter });
    const res = await fetch(`${API_URL}/api/admin/customers?${params}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getCustomer(id: string): Promise<CustomerDetails> {
    const res = await fetch(`${API_URL}/api/admin/customers/${id}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async addNote(customerId: string, note: string): Promise<CustomerNote> {
    const res = await fetch(`${API_URL}/api/admin/customers/${customerId}/notes`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ note }),
    });
    return handleResponse(res);
  },

  async deleteNote(noteId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/admin/customers/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async addDocument(customerId: string, name: string, url: string, type: string): Promise<CustomerDocument> {
    const res = await fetch(`${API_URL}/api/admin/customers/${customerId}/documents`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ name, url, type }),
    });
    return handleResponse(res);
  },

  async deleteDocument(docId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/admin/customers/documents/${docId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  // 4. Availability Calendar & Blocks
  async getCalendar(yearMonth = ''): Promise<CalendarData> {
    const params = yearMonth ? `?yearMonth=${yearMonth}` : '';
    const res = await fetch(`${API_URL}/api/admin/calendar${params}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async blockDate(date: string, reason: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/calendar/block`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ date, reason }),
    });
    return handleResponse(res);
  },

  async unblockDate(date: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/admin/calendar/unblock`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ date }),
    });
    return handleResponse(res);
  },

  // 5. Payments & Invoices
  async getPayments(search = ''): Promise<any[]> {
    const params = search ? `?search=${search}` : '';
    const res = await fetch(`${API_URL}/api/admin/payments${params}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getInvoices(search = ''): Promise<Invoice[]> {
    const params = search ? `?search=${search}` : '';
    const res = await fetch(`${API_URL}/api/admin/invoices${params}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async createInvoice(invoiceData: { bookingId: string; amount: number; dueDate: string; status: string }): Promise<Invoice> {
    const res = await fetch(`${API_URL}/api/admin/invoices`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(invoiceData),
    });
    return handleResponse(res);
  },

  async updateInvoice(id: string, status: string): Promise<Invoice> {
    const res = await fetch(`${API_URL}/api/admin/invoices/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Extended Payments & Refunds API integrations
  async getPaymentDetails(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/payments/${id}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getInvoiceDetails(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/invoice/${id}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async generateInvoice(bookingId: string, dueDate: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/invoice/generate`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ bookingId, dueDate }),
    });
    return handleResponse(res);
  },

  async getPaymentsList(params: { search?: string; status?: string; paymentType?: string; page?: number; limit?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.paymentType) query.append('paymentType', params.paymentType);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_URL}/api/payments?${query.toString()}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getInvoicesList(params: { search?: string; status?: string; page?: number; limit?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_URL}/api/invoices?${query.toString()}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getRefundRequests(): Promise<any[]> {
    const res = await fetch(`${API_URL}/api/payments/refund-requests`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async updateRefundStatus(id: string, refundStatus: 'APPROVED' | 'REJECTED' | 'COMPLETED'): Promise<any> {
    const res = await fetch(`${API_URL}/api/payments/refund/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ refundStatus }),
    });
    return handleResponse(res);
  },

  async getPaymentAnalytics(): Promise<any> {
    const res = await fetch(`${API_URL}/api/payment-analytics`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async sendPaymentReminder(bookingId: string, type: 'ADVANCE' | 'DUE' | 'EVENT'): Promise<any> {
    const res = await fetch(`${API_URL}/api/payments/reminder`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ bookingId, type }),
    });
    return handleResponse(res);
  },

  // 6. Staff & Attendance & Tasks
  async getStaff(): Promise<StaffMember[]> {
    const res = await fetch(`${API_URL}/api/admin/staff`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async createStaff(staffData: any): Promise<{ user: any; staff: StaffMember }> {
    const res = await fetch(`${API_URL}/api/admin/staff`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(staffData),
    });
    return handleResponse(res);
  },

  async deleteStaff(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/admin/staff/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async logAttendance(attendanceData: { staffId: string; date: string; status: string; checkIn?: string; checkOut?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/staff/attendance`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return handleResponse(res);
  },

  async getAttendance(date: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/api/admin/staff/attendance?date=${date}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_URL}/api/admin/tasks`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(taskData: { title: string; description?: string; status?: string; priority?: string; dueDate?: string; assignedToId?: string }): Promise<Task> {
    const res = await fetch(`${API_URL}/api/admin/tasks`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  async updateTask(id: string, status: string): Promise<Task> {
    const res = await fetch(`${API_URL}/api/admin/tasks/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // 7. CRM pipeline
  async getLeads(): Promise<CRMLead[]> {
    const res = await fetch(`${API_URL}/api/admin/crm/leads`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async createLead(leadData: { name: string; email?: string; phone: string; source?: string; status?: string; notes?: string }): Promise<CRMLead> {
    const res = await fetch(`${API_URL}/api/admin/crm/leads`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(res);
  },

  async updateLeadStatus(id: string, status: string): Promise<CRMLead> {
    const res = await fetch(`${API_URL}/api/admin/crm/leads/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async addLeadInquiry(leadId: string, inquiryData: { eventType: string; eventDate: string; guests: number; notes?: string; status?: string }): Promise<CRMInquiry> {
    const res = await fetch(`${API_URL}/api/admin/crm/leads/${leadId}/inquiries`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(inquiryData),
    });
    return handleResponse(res);
  },

  async scheduleFollowUp(followUpData: { inquiryId: string; date: string; notes: string; status?: string }): Promise<CRMFollowUp> {
    const res = await fetch(`${API_URL}/api/admin/crm/followups`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(followUpData),
    });
    return handleResponse(res);
  },

  async completeFollowUp(id: string, outcome: string, nextAction?: string): Promise<CRMFollowUp> {
    const res = await fetch(`${API_URL}/api/admin/crm/followups/${id}/complete`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ outcome, nextAction }),
    });
    return handleResponse(res);
  },

  // 8. Analytics & Report Center
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/analytics`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async getReports(category: string, startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams({ category });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${API_URL}/api/admin/reports?${params}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  // 9. Notifications Management
  async getNotificationTemplates(): Promise<any[]> {
    const res = await fetch(`${API_URL}/api/notifications/templates`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  async updateNotificationTemplate(id: string, templateData: { subject?: string; body?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/api/notifications/templates/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(templateData),
    });
    return handleResponse(res);
  },

  async broadcastNotification(broadcastData: { title: string; message: string; category?: string; priority?: string; targetRole?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/api/notifications/broadcast`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(broadcastData),
    });
    return handleResponse(res);
  },

  async getNotificationAnalytics(): Promise<any> {
    const res = await fetch(`${API_URL}/api/notifications/analytics`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },
};
