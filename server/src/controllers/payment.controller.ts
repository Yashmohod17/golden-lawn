import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { 
  validateCreateOrder, validateVerifyPayment, 
  validateRefundRequest, validateRefundStatus, 
  validateGenerateInvoice 
} from '../validations/payment.validation';
import prisma from '../config/database';

export class PaymentController {
  
  // 1. Get payments list
  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentService.getPayments(req.query);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch payments.' });
    }
  };

  // 2. Get payment by ID
  getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
        include: { booking: true, customer: true, refundRequests: true }
      });
      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found.' });
      }
      return res.status(200).json(payment);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch payment details.' });
    }
  };

  // 3. Create Razorpay order
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateCreateOrder(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const order = await paymentService.createOrder(
        value.bookingId,
        value.amount,
        value.paymentType
      );
      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to initialize payment order.' });
    }
  };

  // 4. Verify Razorpay payment
  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateVerifyPayment(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const updatedBooking = await paymentService.verifyPayment({
        razorpay_order_id: value.razorpay_order_id,
        razorpay_payment_id: value.razorpay_payment_id,
        razorpay_signature: value.razorpay_signature,
        paymentType: req.body.paymentType || 'ADVANCE',
        bookingId: req.body.bookingId
      }, clientIp);

      return res.status(200).json({ success: true, booking: updatedBooking });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Payment verification failed.' });
    }
  };

  // 5. Submit refund request
  requestRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateRefundRequest(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const refund = await paymentService.requestRefund(
        value.paymentId,
        value.refundAmount,
        value.reason,
        clientIp
      );
      return res.status(201).json(refund);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to submit refund request.' });
    }
  };

  // Get all refund requests
  getRefundRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refunds = await paymentService.getRefundRequests();
      return res.status(200).json(refunds);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch refund requests.' });
    }
  };

  // 6. Update refund status (Approve / Reject / Complete)
  updateRefundStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateRefundStatus(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const refund = await paymentService.updateRefundStatus(
        req.params.id,
        value.refundStatus,
        clientIp
      );
      return res.status(200).json(refund);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update refund status.' });
    }
  };

  // 7. Get Invoices list
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentService.getInvoices(req.query);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch invoices.' });
    }
  };

  // 8. Get invoice by ID
  getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: { booking: true, customer: true }
      });
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice record not found.' });
      }
      return res.status(200).json(invoice);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch invoice details.' });
    }
  };

  // 9. Generate manual invoice
  generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateGenerateInvoice(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const invoice = await paymentService.generateInvoice(
        value.bookingId,
        value.dueDate,
        clientIp
      );
      return res.status(201).json(invoice);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to generate invoice.' });
    }
  };

  // 10. Payment Analytics
  getPaymentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await paymentService.getPaymentAnalytics();
      return res.status(200).json(analytics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch payment analytics.' });
    }
  };

  // 11. Get history by booking ID
  getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await paymentService.getPaymentHistory(req.params.bookingId);
      return res.status(200).json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch payment history.' });
    }
  };

  // 12. Get customer payments
  getCustomerPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await paymentService.getCustomerPayments(req.params.customerId);
      return res.status(200).json(payments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch customer payments.' });
    }
  };

  // 13. Send manual payment reminder
  sendReminder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingId, type } = req.body;
      if (!bookingId || !type) {
        return res.status(400).json({ error: 'bookingId and type (ADVANCE, DUE, EVENT) are required.' });
      }
      const reminder = await paymentService.triggerReminder(bookingId, type);
      return res.status(201).json(reminder);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to trigger reminder.' });
    }
  };
}

export const paymentController = new PaymentController();
