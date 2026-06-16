import prisma from '../config/database';
import crypto from 'crypto';

// Basic configuration for Razorpay
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const IS_RAZORPAY_CONFIGURED = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET;

export class PaymentService {
  
  // 1. Create Order in Razorpay or simulate order
  async createOrder(bookingId: string, amount: number, paymentType: 'ADVANCE' | 'INSTALLMENT' | 'FINAL') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error(`Booking not found with ID ${bookingId}`);
    }

    // Check outstanding balance
    const outstanding = booking.cost - booking.paid;
    if (amount > outstanding) {
      throw new Error(`Payment amount (₹${amount.toLocaleString()}) exceeds the outstanding balance (₹${outstanding.toLocaleString()}).`);
    }

    let orderId = '';
    const currency = 'INR';

    if (IS_RAZORPAY_CONFIGURED) {
      try {
        // Direct basic authorization for Razorpay API call
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: amount * 100, // Razorpay expects paise
            currency,
            receipt: `receipt_${bookingId.substring(0, 8)}`
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.description || 'Razorpay order creation failed');
        }

        const data: any = await response.json();
        orderId = data.id;
      } catch (err: any) {
        console.error('Razorpay API Error, falling back to mock mode:', err.message);
        orderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      }
    } else {
      // Razorpay Test / Mock Mode fallback
      orderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      console.log(`Razorpay keys missing. Generated mock order: ${orderId} (Amount: ₹${amount})`);
    }

    // Create record in PaymentTransaction table
    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId,
        amount,
        status: 'CREATED'
      }
    });

    return {
      orderId,
      amount,
      currency,
      bookingId,
      customerId: booking.customerId,
      paymentType,
      transactionId: transaction.id,
      keyId: IS_RAZORPAY_CONFIGURED ? RAZORPAY_KEY_ID : 'rzp_test_mock_key_id'
    };
  }

  // 2. Verify Payment Order
  async verifyPayment(input: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    paymentType: 'ADVANCE' | 'INSTALLMENT' | 'FINAL';
    bookingId: string;
  }, clientIp?: string) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentType, bookingId } = input;

    // Verify signature
    let isValid = false;
    if (razorpay_order_id.startsWith('order_mock_') || !IS_RAZORPAY_CONFIGURED) {
      // Sandbox validation bypass
      isValid = true;
      console.log(`Bypassed signature check for mock payment: ${razorpay_payment_id}`);
    } else {
      const generated_signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = generated_signature === razorpay_signature;
    }

    if (!isValid) {
      // Mark transaction failed
      await prisma.paymentTransaction.updateMany({
        where: { orderId: razorpay_order_id },
        data: { status: 'FAILED' }
      });
      throw new Error('Payment verification failed: Signature mismatch.');
    }

    // Fetch original transaction
    const dbTx = await prisma.paymentTransaction.findFirst({
      where: { orderId: razorpay_order_id }
    });

    const amountPaid = dbTx ? dbTx.amount : 0;

    // Update transaction to success
    if (dbTx) {
      await prisma.paymentTransaction.update({
        where: { id: dbTx.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      });
    }

    // Load booking to modify states
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error(`Booking not found with ID ${bookingId}`);
    }

    const newPaid = booking.paid + amountPaid;
    const newPending = Math.max(0, booking.cost - newPaid);

    // Dynamic statuses
    let nextBookingStatus = booking.status;
    let nextPaymentStatus = 'PARTIALLY_PAID';

    if (newPaid >= booking.cost) {
      nextBookingStatus = 'CONFIRMED';
      nextPaymentStatus = 'PAID';
    } else if (newPaid > 0 && paymentType === 'ADVANCE') {
      nextBookingStatus = 'ADVANCE_PAID';
      nextPaymentStatus = 'PARTIALLY_PAID';
    }

    // Run database transaction to commit financial updates safely
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // 1. Update Booking financials
      const bUpdate = await tx.booking.update({
        where: { id: bookingId },
        data: {
          paid: newPaid,
          pending: newPending,
          status: nextBookingStatus
        }
      });

      // 2. Create Payment log
      const payment = await tx.payment.create({
        data: {
          bookingId,
          customerId: booking.customerId,
          amount: amountPaid,
          paymentType,
          paymentStatus: nextPaymentStatus,
          paymentMethod: 'Razorpay',
          transactionId: razorpay_payment_id,
          paidAt: new Date(),
          method: 'Razorpay',
          status: 'SUCCESS',
          date: new Date().toISOString().substring(0, 10),
          description: `${paymentType} payment processed via Razorpay`
        }
      });

      // Link transaction to payment
      if (dbTx) {
        await tx.paymentTransaction.update({
          where: { id: dbTx.id },
          data: { paymentId: payment.id }
        });
      }

      // 3. Update or generate Invoice
      const existingInvoice = await tx.invoice.findFirst({
        where: { bookingId }
      });

      if (existingInvoice) {
        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            paidAmount: newPaid,
            remainingAmount: newPending,
            status: newPaid >= booking.cost ? 'PAID' : 'PARTIALLY_PAID'
          }
        });
      } else {
        const invoiceYear = new Date().getFullYear();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const invoiceNo = `INV-${invoiceYear}-${randNum}`;

        await tx.invoice.create({
          data: {
            bookingId,
            invoiceNo,
            invoiceNumber: invoiceNo,
            customerId: booking.customerId,
            amount: booking.cost,
            totalAmount: booking.cost,
            paidAmount: newPaid,
            remainingAmount: newPending,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 14 days due
            status: newPaid >= booking.cost ? 'PAID' : 'PARTIALLY_PAID'
          }
        });
      }

      // 4. Update Milestones status
      if (paymentType === 'ADVANCE') {
        await tx.milestone.updateMany({
          where: { bookingId, label: 'Booking Deposit Paid' },
          data: { status: 'COMPLETED', date: new Date().toISOString().substring(0, 10) }
        });
      }
      if (newPaid >= booking.cost) {
        await tx.milestone.updateMany({
          where: { bookingId, label: 'Balance Settlement' },
          data: { status: 'COMPLETED', date: new Date().toISOString().substring(0, 10) }
        });
      }

      // 5. Update Availability Date if Confirmed
      if (nextBookingStatus === 'CONFIRMED' || nextBookingStatus === 'ADVANCE_PAID') {
        await tx.availabilityDate.updateMany({
          where: { date: booking.date },
          data: { status: 'BOOKED' }
        });
      }

      // 6. Log Status History if booking status changed
      if (booking.status !== nextBookingStatus) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId,
            oldStatus: booking.status,
            newStatus: nextBookingStatus,
            changedBy: 'CUSTOMER',
            notes: `Auto-updated status on payment of ₹${amountPaid.toLocaleString()}`
          }
        });
      }

      // 7. Log timeline event
      await tx.bookingTimelineEvent.create({
        data: {
          bookingId,
          title: `${paymentType} Payment Received`,
          description: `Processed payment of ₹${amountPaid.toLocaleString()} via Razorpay. Outstanding balance: ₹${newPending.toLocaleString()}.`,
          type: 'PAYMENT_RECEIVED',
          date: new Date().toISOString().substring(0, 10)
        }
      });

      // 8. Log Admin Audit record
      await tx.auditLog.create({
        data: {
          userId: null,
          action: 'PAYMENT_VERIFICATION_SUCCESS',
          details: JSON.stringify({ bookingId, amount: amountPaid, paymentType, transactionId: razorpay_payment_id }),
          ipAddress: clientIp
        }
      });

      // 9. Create user notification
      if (booking.customerId) {
        await tx.notification.create({
          data: {
            customerId: booking.customerId,
            title: 'Payment Successful',
            message: `Your payment of ₹${amountPaid.toLocaleString()} has been received. Your invoice has been updated.`,
            type: 'success',
            date: new Date().toISOString().substring(0, 10)
          }
        });
      }

      return bUpdate;
    });

    return updatedBooking;
  }

  // 3. Request Refund
  async requestRefund(paymentId: string, refundAmount: number, reason: string, clientIp?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    });

    if (!payment) {
      throw new Error(`Payment record not found with ID ${paymentId}`);
    }

    if (refundAmount > payment.amount) {
      throw new Error(`Refund amount (₹${refundAmount.toLocaleString()}) cannot exceed the payment amount (₹${payment.amount.toLocaleString()}).`);
    }

    // Check if there is already a refund request
    const existing = await prisma.refundRequest.findFirst({
      where: { paymentId }
    });
    if (existing) {
      throw new Error('A refund request has already been submitted for this transaction.');
    }

    const refund = await prisma.refundRequest.create({
      data: {
        paymentId,
        refundAmount,
        reason,
        refundStatus: 'REQUESTED'
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'REFUND_REQUEST_CREATED',
        details: JSON.stringify({ paymentId, refundAmount, reason, refundId: refund.id }),
        ipAddress: clientIp
      }
    });

    return refund;
  }

  // Get Refund Requests
  async getRefundRequests() {
    return prisma.refundRequest.findMany({
      include: {
        payment: {
          include: {
            booking: true,
            customer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // 4. Update Refund Status
  async updateRefundStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED', clientIp?: string) {
    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        payment: {
          include: { booking: true }
        }
      }
    });

    if (!refund) {
      throw new Error(`Refund request not found with ID ${id}`);
    }

    const bookingId = refund.payment.bookingId;

    const updatedRefund = await prisma.$transaction(async (tx) => {
      // Update refund status
      const updated = await tx.refundRequest.update({
        where: { id },
        data: { refundStatus: status }
      });

      if (status === 'COMPLETED') {
        // Adjust the financials of the booking
        const newPaid = Math.max(0, refund.payment.booking.paid - refund.refundAmount);
        const newPending = refund.payment.booking.cost - newPaid;

        // If completely refunded, mark booking status as cancelled/refunded
        const finalBookingStatus = newPaid === 0 ? 'CANCELLED' : refund.payment.booking.status;

        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paid: newPaid,
            pending: newPending,
            status: finalBookingStatus
          }
        });

        // Update Payment status to REFUNDED
        await tx.payment.update({
          where: { id: refund.paymentId },
          data: {
            paymentStatus: 'REFUNDED',
            status: 'REFUNDED'
          }
        });

        // Update Invoice status
        await tx.invoice.updateMany({
          where: { bookingId },
          data: {
            paidAmount: newPaid,
            remainingAmount: newPending,
            status: newPaid === 0 ? 'UNPAID' : 'PARTIALLY_PAID'
          }
        });

        // Create timeline log
        await tx.bookingTimelineEvent.create({
          data: {
            bookingId,
            title: 'Refund Completed',
            description: `Refund of ₹${refund.refundAmount.toLocaleString()} has been approved and completed.`,
            type: 'STATUS_CHANGE',
            date: new Date().toISOString().substring(0, 10)
          }
        });

        if (refund.payment.booking.customerId) {
          await tx.notification.create({
            data: {
              customerId: refund.payment.booking.customerId,
              title: 'Refund Processed',
              message: `A refund of ₹${refund.refundAmount.toLocaleString()} has been processed and credited back.`,
              type: 'info',
              date: new Date().toISOString().substring(0, 10)
            }
          });
        }
      } else if (status === 'APPROVED') {
        if (refund.payment.booking.customerId) {
          await tx.notification.create({
            data: {
              customerId: refund.payment.booking.customerId,
              title: 'Refund Approved',
              message: `Your refund request of ₹${refund.refundAmount.toLocaleString()} has been approved.`,
              type: 'success',
              date: new Date().toISOString().substring(0, 10)
            }
          });
        }
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: null,
          action: `REFUND_${status}`,
          details: JSON.stringify({ refundId: id, bookingId, status }),
          ipAddress: clientIp
        }
      });

      return updated;
    });

    return updatedRefund;
  }

  // 5. Get Payments list with query parameters
  async getPayments(query: any) {
    const { status, paymentType, search, limit = 10, page = 1 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.paymentStatus = status;
    }
    if (paymentType && paymentType !== 'ALL') {
      whereClause.paymentType = paymentType;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { transactionId: { contains: search } },
        { booking: { name: { contains: search } } }
      ];
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip
    });

    const totalCount = await prisma.payment.count({ where: whereClause });

    return {
      payments,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page)
    };
  }

  // 6. Get Payment History for a Booking
  async getPaymentHistory(bookingId: string) {
    return prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // 7. Get Customer Payments
  async getCustomerPayments(customerId: string) {
    return prisma.payment.findMany({
      where: { customerId },
      include: { booking: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 8. Get Invoices
  async getInvoices(query: any) {
    const { status, limit = 10, page = 1 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        booking: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip
    });

    const totalCount = await prisma.invoice.count({ where: whereClause });

    return {
      invoices,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page)
    };
  }

  // 9. Generate manual Invoice
  async generateInvoice(bookingId: string, dueDate: string, clientIp?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error(`Booking not found with ID ${bookingId}`);
    }

    const existing = await prisma.invoice.findFirst({
      where: { bookingId }
    });

    if (existing) {
      return existing;
    }

    const invoiceYear = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${invoiceYear}-${randNum}`;

    const invoice = await prisma.invoice.create({
      data: {
        bookingId,
        invoiceNo,
        invoiceNumber: invoiceNo,
        customerId: booking.customerId,
        amount: booking.cost,
        totalAmount: booking.cost,
        paidAmount: booking.paid,
        remainingAmount: booking.pending,
        dueDate,
        status: booking.paid >= booking.cost ? 'PAID' : booking.paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'INVOICE_GENERATED',
        details: JSON.stringify({ bookingId, invoiceId: invoice.id, invoiceNo }),
        ipAddress: clientIp
      }
    });

    return invoice;
  }

  // 10. Payment Analytics
  async getPaymentAnalytics() {
    // Basic aggregations
    const payments = await prisma.payment.findMany();
    const refundRequests = await prisma.refundRequest.findMany();
    
    // Revenue calculations
    const totalRevenue = payments.filter(p => p.paymentStatus !== 'REFUNDED').reduce((acc, p) => acc + p.amount, 0);
    
    // Monthly collections trends
    const monthlyCollections: Record<string, number> = {};
    payments.forEach(p => {
      const month = p.date.substring(0, 7) || new Date(p.createdAt).toISOString().substring(0, 7);
      monthlyCollections[month] = (monthlyCollections[month] || 0) + p.amount;
    });

    const statusCounts = {
      PAID: payments.filter(p => p.paymentStatus === 'PAID').length,
      PARTIALLY_PAID: payments.filter(p => p.paymentStatus === 'PARTIALLY_PAID').length,
      REFUNDED: payments.filter(p => p.paymentStatus === 'REFUNDED').length,
      FAILED: payments.filter(p => p.paymentStatus === 'FAILED').length,
    };

    const refundStats = {
      pendingAmount: refundRequests.filter(r => r.refundStatus === 'REQUESTED').reduce((acc, r) => acc + r.refundAmount, 0),
      completedAmount: refundRequests.filter(r => r.refundStatus === 'COMPLETED').reduce((acc, r) => acc + r.refundAmount, 0),
      count: refundRequests.length
    };

    return {
      totalRevenue,
      monthlyCollections,
      statusCounts,
      refundStats
    };
  }

  // 11. Reminders
  async triggerReminder(bookingId: string, type: 'ADVANCE' | 'DUE' | 'EVENT') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error(`Booking not found with ID ${bookingId}`);
    }

    const amount = booking.pending;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const reminder = await prisma.paymentReminder.create({
      data: {
        bookingId,
        type,
        amount,
        dueDate,
        status: 'SENT'
      }
    });

    // Notify customer
    if (booking.customerId) {
      await prisma.notification.create({
        data: {
          customerId: booking.customerId,
          title: `Payment Reminder: ${type}`,
          message: `Your payment of ₹${amount.toLocaleString()} is due by ${dueDate} for your upcoming event on ${booking.date}.`,
          type: 'warning',
          date: new Date().toISOString().substring(0, 10)
        }
      });
    }

    return reminder;
  }
}

export const paymentService = new PaymentService();
