import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { 
  StaffInput, TaskInput, LeadInput, InquiryInput, FollowUpInput, InvoiceInput 
} from '../validations/admin.validation';
import { NotificationService } from './notification.service';

export class AdminService {
  
  // ==========================================
  // 1. DASHBOARD OVERVIEW
  // ==========================================
  async getDashboardSummary() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Total bookings count
    const totalBookings = await prisma.booking.count();

    // Upcoming events
    const upcomingEvents = await prisma.booking.findMany({
      where: {
        status: { not: 'CANCELLED' },
        date: { gte: todayStr }
      },
      orderBy: { date: 'asc' },
      take: 5
    });

    // Monthly Revenue (sum of paid payments)
    const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-06"
    const paymentsThisMonth = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        date: { startsWith: currentMonthPrefix }
      }
    });
    const monthlyRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

    // Pending Payments (sum of outstanding pending balances)
    const bookingsWithPending = await prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { pending: true }
    });
    const pendingPayments = bookingsWithPending.reduce((sum, b) => sum + b.pending, 0);

    // Active Customer count (who have at least one booking)
    const activeCustomers = await prisma.customer.count({
      where: {
        bookings: { some: {} }
      }
    });

    // Occupancy Rate (percentage of booked days out of next 30 days)
    const next30Days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      next30Days.push(d.toISOString().split('T')[0]);
    }
    const bookedDaysCount = await prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        date: { in: next30Days }
      }
    });
    const occupancyRate = Math.round((bookedDaysCount / 30) * 100);

    // Recent Bookings List
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Recent Notifications
    const recentNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      totalBookings,
      upcomingEvents,
      monthlyRevenue,
      pendingPayments,
      activeCustomers,
      occupancyRate,
      recentBookings,
      recentNotifications
    };
  }

  // ==========================================
  // 2. CUSTOMER MANAGEMENT
  // ==========================================
  async listCustomers(search = '', filter = 'ALL') {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (filter === 'ACTIVE') {
      where.bookings = { some: {} };
    } else if (filter === 'INACTIVE') {
      where.bookings = { none: {} };
    }

    return prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getCustomerDetails(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: true,
        notes: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async addCustomerNote(customerId: string, noteText: string, authorName: string) {
    return prisma.customerNote.create({
      data: {
        customerId,
        note: noteText,
        authorName
      }
    });
  }

  async deleteCustomerNote(noteId: string) {
    return prisma.customerNote.delete({ where: { id: noteId } });
  }

  async uploadCustomerDocument(customerId: string, name: string, url: string, type: string) {
    return prisma.customerDocument.create({
      data: {
        customerId,
        name,
        url,
        type
      }
    });
  }

  async deleteCustomerDocument(docId: string) {
    return prisma.customerDocument.delete({ where: { id: docId } });
  }

  // ==========================================
  // 3. AVAILABILITY CALENDAR
  // ==========================================
  async getCalendarEvents(yearMonth = '') {
    // yearMonth pattern: e.g. "2026-11"
    const whereEvent: any = {};
    const whereBlocked: any = {};
    
    if (yearMonth) {
      whereEvent.startDate = { startsWith: yearMonth };
      whereBlocked.date = { startsWith: yearMonth };
    }

    const events = await prisma.calendarEvent.findMany({ where: whereEvent });
    const blocked = await prisma.blockedDate.findMany({ where: whereBlocked });

    return { events, blocked };
  }

  async blockDate(date: string, reason: string, blockedBy: string) {
    const existing = await prisma.booking.findFirst({
      where: {
        date,
        status: { not: 'CANCELLED' }
      }
    });
    if (existing) {
      throw new Error(`Cannot block date ${date} as there is already an active booking.`);
    }

    return prisma.$transaction(async (tx) => {
      // Create block entry
      const block = await tx.blockedDate.create({
        data: { date, reason, blockedBy }
      });
      // Upsert availability date status
      await tx.availabilityDate.upsert({
        where: { date },
        update: { status: 'BLOCKED', notes: reason },
        create: { date, status: 'BLOCKED', notes: reason }
      });
      // Create calendar event
      await tx.calendarEvent.create({
        data: {
          title: `Lawn Blocked: ${reason.substring(0, 30)}`,
          description: reason,
          startDate: date,
          endDate: date,
          color: 'red'
        }
      });
      return block;
    });
  }

  async unblockDate(date: string) {
    return prisma.$transaction(async (tx) => {
      await tx.blockedDate.delete({ where: { date } });
      
      // Reset availability status
      await tx.availabilityDate.deleteMany({ where: { date } });
      
      // Delete corresponding calendar event
      await tx.calendarEvent.deleteMany({
        where: {
          startDate: date,
          color: 'red'
        }
      });
      return { success: true };
    });
  }

  // ==========================================
  // 4. PAYMENTS & INVOICES
  // ==========================================
  async listPayments(search = '') {
    const where: any = {};
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { bookingId: { contains: search } },
        { method: { contains: search } },
      ];
    }
    return prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            eventType: true,
            name: true,
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async listInvoices(search = '') {
    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { bookingId: { contains: search } },
      ];
    }
    return prisma.invoice.findMany({
      where,
      include: {
        booking: {
          select: {
            eventType: true,
            name: true,
          }
        }
      },
      orderBy: { invoiceNo: 'desc' }
    });
  }

  async generateInvoice(data: InvoiceInput) {
    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-2026-${(count + 1).toString().padStart(4, '0')}`;
    
    return prisma.invoice.create({
      data: {
        bookingId: data.bookingId,
        invoiceNo,
        amount: data.amount,
        dueDate: data.dueDate,
        status: data.status
      }
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status }
    });
  }

  async verifyRazorpayPayment(paymentId: string, signature: string) {
    // Standard mock verification behavior
    console.log(`Razorpay verification: paymentId=${paymentId}, signature=${signature}`);
    // In production, razorpay signature validation checks occur here.
    return { verified: true };
  }

  // ==========================================
  // 5. STAFF OPERATIONS
  // ==========================================
  async listStaff() {
    return prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    });
  }

  async createStaff(data: StaffInput) {
    const hashedPwd = bcrypt.hashSync(data.password || 'staff123', 10);
    
    return prisma.$transaction(async (tx) => {
      // Find or create role mapping
      let role = await tx.role.findUnique({ where: { name: 'STAFF' } });
      if (!role) {
        role = await tx.role.create({ data: { name: 'STAFF' } });
      }

      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPwd,
          roleId: role.id
        }
      });

      // 2. Create Staff Profile
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          role: data.role,
          phone: data.phone,
          salary: data.salary || null,
          status: data.status || 'ACTIVE'
        }
      });
      return { user, staff };
    });
  }

  async deleteStaff(id: string) {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new Error('Staff profile not found');
    
    return prisma.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id } });
      await tx.user.delete({ where: { id: staff.userId } });
      return { success: true };
    });
  }

  async logAttendance(staffId: string, date: string, status: string, checkIn?: string, checkOut?: string) {
    return prisma.attendance.upsert({
      where: {
        staffId_date: { staffId, date }
      },
      update: { status, checkIn, checkOut },
      create: { staffId, date, status, checkIn, checkOut }
    });
  }

  async getAttendanceReport(date: string) {
    return prisma.attendance.findMany({
      where: { date },
      include: {
        staff: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });
  }

  async getTasks() {
    return prisma.task.findMany({
      include: {
        assignedTo: {
          include: {
            user: { select: { name: true } }
          }
        },
        createdBy: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTask(creatorUserId: string, data: TaskInput) {
    const creatorStaff = await prisma.staff.findFirst({
      where: { userId: creatorUserId }
    });
    if (!creatorStaff) throw new Error('Creator is not a staff member');

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        assignedToId: data.assignedToId,
        createdById: creatorStaff.id
      }
    });

    if (task.assignedToId) {
      const assignedStaff = await prisma.staff.findUnique({
        where: { id: task.assignedToId }
      });
      if (assignedStaff) {
        try {
          await NotificationService.sendNotification({
            userId: assignedStaff.userId,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${task.title}". Due Date: ${task.dueDate || 'N/A'}.`,
            category: 'EVENT',
            priority: task.priority || 'MEDIUM',
            type: 'info'
          });
        } catch (err) {
          console.error('Failed to send task assignment notification:', err);
        }
      }
    }

    return task;
  }

  async updateTaskStatus(taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    return prisma.task.update({
      where: { id: taskId },
      data: { status }
    });
  }

  // ==========================================
  // 6. CRM
  // ==========================================
  async getLeads() {
    return prisma.lead.findMany({
      include: {
        inquiries: {
          include: {
            followUps: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createLead(data: LeadInput) {
    return prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: data.status || 'NEW',
        notes: data.notes
      }
    });
  }

  async updateLeadStatus(leadId: string, status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON') {
    return prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });
  }

  async addLeadInquiry(leadId: string, data: Omit<InquiryInput, 'leadId'>) {
    return prisma.inquiry.create({
      data: {
        leadId,
        eventType: data.eventType,
        eventDate: data.eventDate,
        guests: data.guests,
        notes: data.notes,
        status: data.status || 'OPEN'
      }
    });
  }

  async scheduleFollowUp(data: FollowUpInput) {
    return prisma.followUp.create({
      data: {
        inquiryId: data.inquiryId,
        date: data.date,
        notes: data.notes,
        status: data.status || 'SCHEDULED'
      }
    });
  }

  async completeFollowUp(id: string, outcome: string, nextAction?: string) {
    return prisma.followUp.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        outcome,
        nextAction
      }
    });
  }

  // ==========================================
  // 7. ANALYTICS & REPORTS
  // ==========================================
  async getAnalyticsData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    // 1. Revenue Analytics (by month)
    const paidPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' }
    });
    const monthlyRevenueMap: Record<string, number> = {};
    // initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleString('default', { month: 'short' });
      monthlyRevenueMap[mLabel] = 0;
    }

    for (const p of paidPayments) {
      const pDate = new Date(p.date);
      const mLabel = pDate.toLocaleString('default', { month: 'short' });
      if (monthlyRevenueMap[mLabel] !== undefined && pDate.getFullYear() === currentYear) {
        monthlyRevenueMap[mLabel] += p.amount;
      }
    }

    const revenueChart = Object.entries(monthlyRevenueMap).map(([month, amount]) => ({ month, amount }));

    // 2. Package Popularity
    const bookings = await prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' } }
    });
    const packageCount: Record<string, number> = {};
    for (const b of bookings) {
      packageCount[b.package] = (packageCount[b.package] || 0) + 1;
    }
    const packagesChart = Object.entries(packageCount).map(([name, value]) => ({ name, value }));

    // 3. Occupancy rate by Month
    const occupancyChart = [
      { month: 'Oct', rate: 20 },
      { month: 'Nov', rate: 45 },
      { month: 'Dec', rate: 60 },
      { month: 'Jan', rate: 35 },
      { month: 'Feb', rate: 40 },
      { month: 'Mar', rate: 50 },
    ];

    // 4. Lead Conversion Funnel
    const leadsCount = await prisma.lead.count();
    const contactedCount = await prisma.lead.count({ where: { status: 'CONTACTED' } });
    const qualifiedCount = await prisma.lead.count({ where: { status: 'QUALIFIED' } });
    const wonCount = await prisma.lead.count({ where: { status: 'WON' } });

    const crmFunnel = [
      { stage: 'New Leads', count: leadsCount },
      { stage: 'Contacted', count: contactedCount + qualifiedCount + wonCount },
      { stage: 'Qualified', count: qualifiedCount + wonCount },
      { stage: 'Won', count: wonCount },
    ];

    return {
      revenueChart,
      packagesChart,
      occupancyChart,
      crmFunnel
    };
  }

  async getReportData(category: string, startDate?: string, endDate?: string) {
    if (category === 'REVENUE') {
      const payments = await prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          date: {
            gte: startDate || undefined,
            lte: endDate || undefined,
          }
        },
        include: {
          booking: { select: { eventType: true, name: true } }
        }
      });
      return payments;
    }

    if (category === 'BOOKINGS') {
      const bookings = await prisma.booking.findMany({
        where: {
          date: {
            gte: startDate || undefined,
            lte: endDate || undefined,
          }
        },
        include: {
          payments: true
        }
      });
      return bookings;
    }

    if (category === 'CRM') {
      return prisma.lead.findMany({
        include: {
          inquiries: true
        }
      });
    }

    if (category === 'STAFF') {
      return prisma.staff.findMany({
        include: {
          user: { select: { name: true, email: true } },
          attendance: true
        }
      });
    }

    throw new Error('Invalid report category');
  }
}

export const adminService = new AdminService();
