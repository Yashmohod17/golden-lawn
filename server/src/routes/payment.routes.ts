import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/security.middleware';
import prisma from '../config/database';

const router = Router();

// Enforce token authentication on all payment routes
router.use(authenticateToken);

// 1. Create order
router.post('/payments/create-order', paymentController.createOrder);

// 2. Verify payment order
router.post('/payments/verify', paymentController.verifyPayment);

// 3. Request refund
router.post('/payments/refund-request', paymentController.requestRefund);

// Get all refund requests (Admin only)
router.get('/payments/refund-requests', requirePermission('read:payments'), paymentController.getRefundRequests);

// 4. Update refund status (Approve / Reject / Complete) - Admin only
router.put('/payments/refund/:id', requirePermission('write:payments'), paymentController.updateRefundStatus);

// 5. Get customer-specific payments
router.get('/payments/customer/:customerId', async (req, res, next) => {
  try {
    const { role, id: userId } = req.user!;
    const targetCustomerId = req.params.customerId;
    
    // Safety check: Customers can only view their own payments
    if (role === 'CUSTOMER' && userId !== targetCustomerId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other customer records.' });
    }
    
    return paymentController.getCustomerPayments(req, res, next);
  } catch (err) {
    next(err);
  }
});

// 6. Get payment history by Booking ID
router.get('/payments/history/:bookingId', async (req, res, next) => {
  try {
    const { role, id: userId } = req.user!;
    const bookingId = req.params.bookingId;
    
    // Safety check: Customers can only view their own booking payment history
    if (role === 'CUSTOMER') {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.customerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access other booking details.' });
      }
    }
    
    return paymentController.getPaymentHistory(req, res, next);
  } catch (err) {
    next(err);
  }
});

// 7. Get detailed Payment by ID
router.get('/payments/:id', async (req, res, next) => {
  try {
    const { role, id: userId } = req.user!;
    const paymentId = req.params.id;
    
    // Safety check: Customers can only view their own payments
    if (role === 'CUSTOMER') {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.customerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access other payment records.' });
      }
    } else {
      // Admin permission check
      const hasPerm = req.user?.role === 'OWNER' || req.user?.role === 'MANAGER';
      if (!hasPerm) {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
      }
    }
    
    return paymentController.getPaymentById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// 8. Get global payments (Admin only)
router.get('/payments', requirePermission('read:payments'), paymentController.getPayments);

// 9. Get invoices (Admin only)
router.get('/invoices', requirePermission('read:payments'), paymentController.getInvoices);

// 10. Get invoice by ID
router.get('/invoice/:id', async (req, res, next) => {
  try {
    const { role, id: userId } = req.user!;
    const invoiceId = req.params.id;
    
    // Safety check: Customers can only view their own invoices
    if (role === 'CUSTOMER') {
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice || invoice.customerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access other invoice records.' });
      }
    } else {
      // Admin permission check
      const hasPerm = req.user?.role === 'OWNER' || req.user?.role === 'MANAGER';
      if (!hasPerm) {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
      }
    }
    
    return paymentController.getInvoiceById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// 11. Generate manual invoice (Admin only)
router.post('/invoice/generate', requirePermission('write:payments'), paymentController.generateInvoice);

// 12. Get payment analytics (Admin only)
router.get('/payment-analytics', requirePermission('read:analytics'), paymentController.getPaymentAnalytics);

// 13. Send manual payment reminder (Admin only)
router.post('/payments/reminder', requirePermission('write:payments'), paymentController.sendReminder);

export default router;
