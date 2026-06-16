import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/security.middleware';

const router = Router();

// 1. Admin Authentication
router.post('/auth/login', adminController.login);

// All subsequent routes require a valid administrative session token
router.use(authenticateToken);

// 2. Dashboard Summary
router.get('/summary', adminController.getSummary);

// 3. Customer Management
router.get('/customers', requirePermission('read:bookings'), adminController.getCustomers);
router.get('/customers/:id', requirePermission('read:bookings'), adminController.getCustomer);
router.post('/customers/:id/notes', requirePermission('write:bookings'), adminController.addNote);
router.delete('/customers/notes/:noteId', requirePermission('write:bookings'), adminController.deleteNote);
router.post('/customers/:id/documents', requirePermission('write:bookings'), adminController.addDocument);
router.delete('/customers/documents/:docId', requirePermission('write:bookings'), adminController.deleteDocument);

// 4. Availability Calendar & Blocks
router.get('/calendar', adminController.getCalendar);
router.post('/calendar/block', requirePermission('write:bookings'), adminController.blockDate);
router.post('/calendar/unblock', requirePermission('write:bookings'), adminController.unblockDate);

// 5. Payments & Invoices
router.get('/payments', requirePermission('read:payments'), adminController.getPayments);
router.get('/invoices', requirePermission('read:payments'), adminController.getInvoices);
router.post('/invoices', requirePermission('write:payments'), adminController.createInvoice);
router.patch('/invoices/:id', requirePermission('write:payments'), adminController.updateInvoice);

// 6. Staff Management & Tasks
router.get('/staff', requirePermission('read:staff'), adminController.getStaff);
router.post('/staff', requirePermission('write:staff'), adminController.createStaff);
router.delete('/staff/:id', requirePermission('write:staff'), adminController.deleteStaff);
router.post('/staff/attendance', requirePermission('write:staff'), adminController.logAttendance);
router.get('/staff/attendance', requirePermission('read:staff'), adminController.getAttendance);

router.get('/tasks', requirePermission('read:staff'), adminController.getTasks);
router.post('/tasks', requirePermission('write:staff'), adminController.createTask);
router.patch('/tasks/:id', requirePermission('write:staff'), adminController.updateTask);

// 7. CRM pipeline (Leads / inquiries / follow-ups)
router.get('/crm/leads', requirePermission('read:crm'), adminController.getLeads);
router.post('/crm/leads', requirePermission('write:crm'), adminController.createLead);
router.patch('/crm/leads/:id/status', requirePermission('write:crm'), adminController.updateLead);
router.post('/crm/leads/:id/inquiries', requirePermission('write:crm'), adminController.addInquiry);
router.post('/crm/followups', requirePermission('write:crm'), adminController.scheduleFollowUp);
router.patch('/crm/followups/:id/complete', requirePermission('write:crm'), adminController.completeFollowUp);

// 8. Analytics & Report Center
router.get('/analytics', requirePermission('read:analytics'), adminController.getAnalytics);
router.get('/reports', requirePermission('read:reports'), adminController.getReport);

export default router;
