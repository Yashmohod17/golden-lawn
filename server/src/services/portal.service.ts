import prisma from '../config/database';
import { ProfileUpdateInput, PaymentSimulationInput } from '../validations/portal.validation';

export class PortalService {
  // Utility: get default customer id if none is provided
  async getDefaultCustomerId(): Promise<string> {
    const customer = await prisma.customer.findFirst();
    if (!customer) {
      throw new Error('No customers found in database. Please run seeding first.');
    }
    return customer.id;
  }

  async getCustomerProfile(customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    const customer = await prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) throw new Error('Customer profile not found');
    return customer;
  }

  async getCustomerBookings(customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    return prisma.booking.findMany({
      where: { customerId: id },
      include: {
        milestones: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getBookingDetails(bookingId: string, customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        milestones: true,
        payments: true,
      },
    });

    if (!booking || (booking.customerId !== null && booking.customerId !== id)) {
      throw new Error('Booking not found or access denied');
    }
    return booking;
  }

  async getPaymentHistory(customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    return prisma.payment.findMany({
      where: {
        booking: {
          customerId: id,
        },
      },
      include: {
        booking: {
          select: {
            eventType: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async updateProfile(customerId: string, data: ProfileUpdateInput) {
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    // Create a profile updated notification
    await prisma.notification.create({
      data: {
        customerId,
        date: new Date().toISOString().split('T')[0],
        title: 'Profile Updated',
        message: 'Your portal profile settings and preferences were successfully updated.',
        type: 'success',
        read: false,
      },
    });

    return updated;
  }

  async getNotifications(customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    return prisma.notification.findMany({
      where: { customerId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markNotificationRead(notificationId: string, customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    
    // Safety check
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.customerId !== id) {
      throw new Error('Notification not found or access denied');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllNotificationsRead(customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());
    return prisma.notification.updateMany({
      where: { customerId: id, read: false },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: string, customerId?: string) {
    const id = customerId || (await this.getDefaultCustomerId());

    // Safety check
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.customerId !== id) {
      throw new Error('Notification not found or access denied');
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async simulatePayment(customerId: string, data: PaymentSimulationInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking || (booking.customerId !== null && booking.customerId !== customerId)) {
      throw new Error('Booking not found or access denied');
    }

    if (data.amount > booking.pending) {
      throw new Error('Payment amount exceeds the outstanding balance');
    }

    const receiptId = `RCP-${Math.floor(10000 + Math.random() * 90000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // Transaction execution
    return prisma.$transaction(async (tx) => {
      // 1. Create payment receipt
      const payment = await tx.payment.create({
        data: {
          id: receiptId,
          bookingId: data.bookingId,
          amount: data.amount,
          method: data.method,
          date: todayStr,
          status: 'SUCCESS',
          description: 'Milestone Balance Payment',
        },
      });

      // Log payment in timeline events
      await tx.bookingTimelineEvent.create({
        data: {
          bookingId: data.bookingId,
          title: 'Payment Received',
          description: `Payment of ₹${data.amount.toLocaleString()} received via ${data.method} (Receipt ${receiptId}).`,
          type: 'PAYMENT_RECEIVED',
          date: todayStr,
        },
      });

      // 2. Update booking balances
      const newPaid = booking.paid + data.amount;
      const newPending = Math.max(0, booking.cost - newPaid);

      const updatedBooking = await tx.booking.update({
        where: { id: data.bookingId },
        data: {
          paid: newPaid,
          pending: newPending,
        },
      });

      // 3. Complete 'Balance Settlement' milestone if fully paid
      if (newPending === 0) {
        await tx.milestone.updateMany({
          where: {
            bookingId: data.bookingId,
            label: 'Balance Settlement',
          },
          data: {
            status: 'COMPLETED',
            date: todayStr,
          },
        });

        // Log milestone completed in timeline events
        await tx.bookingTimelineEvent.create({
          data: {
            bookingId: data.bookingId,
            title: 'Milestone Completed: Balance Settlement',
            description: 'Outstanding balance fully settled. All payments cleared.',
            type: 'MILESTONE_UPDATE',
            date: todayStr,
          },
        });
      }

      // 4. Create successful transaction notification
      await tx.notification.create({
        data: {
          customerId,
          date: todayStr,
          title: 'Payment Successful',
          message: `Receipt ${receiptId} generated. Payment of ₹${data.amount.toLocaleString()} received via ${data.method}.`,
          type: 'success',
          read: false,
        },
      });

      return { payment, booking: updatedBooking };
    });
  }

  // Get Invoices for Customer
  async getCustomerInvoices(customerId: string) {
    return prisma.invoice.findMany({
      where: { customerId },
      include: {
        booking: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const portalService = new PortalService();
