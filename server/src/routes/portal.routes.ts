import { Router } from 'express';
import { portalController } from '../controllers/portal.controller';

const router = Router();

// Customer Profile
router.get('/profile', portalController.getProfile);
router.patch('/profile', portalController.updateProfile);

// Customer Bookings
router.get('/bookings', portalController.getBookings);
router.get('/bookings/:id', portalController.getBookingDetails);

// Payments & Simulated Transactions
router.get('/payments', portalController.getPayments);
router.get('/invoices', portalController.getInvoices);
router.post('/payments/simulate', portalController.simulatePayment);

// Customer Notifications
router.get('/notifications', portalController.getNotifications);
router.patch('/notifications/:id/read', portalController.markNotificationRead);
router.post('/notifications/read-all', portalController.markAllNotificationsRead);
router.delete('/notifications/:id', portalController.deleteNotification);

export default router;
