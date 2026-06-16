import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Secure all notification endpoints with JWT authentication
router.use(authenticateToken);

// User-specific endpoints (accessible by CUSTOMER, STAFF, MANAGER, OWNER)
router.get('/notifications', NotificationController.getNotifications);
router.put('/notifications/read-all', NotificationController.markAllAsRead);
router.put('/notifications/:id/read', NotificationController.markAsRead);
router.get('/notifications/preferences', NotificationController.getPreferences);
router.put('/notifications/preferences', NotificationController.updatePreferences);

// Administrative endpoints (accessible by OWNER and MANAGER)
router.get('/notifications/templates', requireRole(['OWNER', 'MANAGER']), NotificationController.getTemplates);
router.put('/notifications/templates/:id', requireRole(['OWNER', 'MANAGER']), NotificationController.updateTemplate);
router.post('/notifications/broadcast', requireRole(['OWNER', 'MANAGER']), NotificationController.broadcast);
router.get('/notifications/analytics', requireRole(['OWNER', 'MANAGER']), NotificationController.getAnalytics);

export default router;
