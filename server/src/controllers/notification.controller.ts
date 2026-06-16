import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import {
  validateBroadcastInput,
  validatePreferenceInput,
  validateTemplateUpdate,
} from '../validations/notification.validation';

const prisma = new PrismaClient();

export class NotificationController {
  /**
   * Get notifications for current user/customer
   */
  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { category, priority, isRead, limit = 50 } = req.query;

    const whereClause: any = {};
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.id;
    } else {
      whereClause.userId = user.id;
    }

    if (category) {
      whereClause.category = String(category).toUpperCase();
    }
    if (priority) {
      whereClause.priority = String(priority).toUpperCase();
    }
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      return res.json(notifications);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch notifications: ' + err.message });
    }
  }

  /**
   * Mark a notification as read
   */
  public static async markAsRead(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const whereClause: any = { id };
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.id;
    } else {
      whereClause.userId = user.id;
    }

    try {
      const notification = await prisma.notification.findFirst({ where: whereClause });
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          isRead: true,
        },
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update notification: ' + err.message });
    }
  }

  /**
   * Mark all notifications as read
   */
  public static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { isRead: false };
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.id;
    } else {
      whereClause.userId = user.id;
    }

    try {
      await prisma.notification.updateMany({
        where: whereClause,
        data: {
          read: true,
          isRead: true,
        },
      });

      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update notifications: ' + err.message });
    }
  }

  /**
   * Get preferences for current user
   */
  public static async getPreferences(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      let pref = await prisma.notificationPreference.findUnique({
        where: { userId: user.id },
      });

      if (!pref) {
        // Create defaults if not present
        pref = await prisma.notificationPreference.create({
          data: {
            userId: user.id,
            emailEnabled: true,
            inAppEnabled: true,
          },
        });
      }

      return res.json(pref);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch preferences: ' + err.message });
    }
  }

  /**
   * Update preferences for current user
   */
  public static async updatePreferences(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error, value } = validatePreferenceInput(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const updated = await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: value!,
        create: {
          userId: user.id,
          emailEnabled: value?.emailEnabled ?? true,
          inAppEnabled: value?.inAppEnabled ?? true,
        },
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update preferences: ' + err.message });
    }
  }

  /**
   * Get all templates (Owner/Manager only)
   */
  public static async getTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const templates = await prisma.notificationTemplate.findMany();
      return res.json(templates);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch templates: ' + err.message });
    }
  }

  /**
   * Update template details (Owner/Manager only)
   */
  public static async updateTemplate(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { error, value } = validateTemplateUpdate(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const template = await prisma.notificationTemplate.findUnique({ where: { id } });
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const updated = await prisma.notificationTemplate.update({
        where: { id },
        data: value!,
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update template: ' + err.message });
    }
  }

  /**
   * Send broadcast notification (Owner/Manager only)
   */
  public static async broadcast(req: AuthenticatedRequest, res: Response) {
    const { error, value } = validateBroadcastInput(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const sentNotifications = await NotificationService.broadcastNotification({
        title: value!.title,
        message: value!.message,
        category: value!.category,
        priority: value!.priority,
        targetRole: value!.targetRole as any,
      });

      return res.json({
        success: true,
        recipientCount: sentNotifications.length,
        message: `Broadcast successfully dispatched to ${sentNotifications.length} active users.`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to dispatch broadcast: ' + err.message });
    }
  }

  /**
   * Get notification analytics (Owner/Manager only)
   */
  public static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const totalSent = await prisma.notification.count();
      const unreadCount = await prisma.notification.count({ where: { isRead: false } });
      const readCount = totalSent - unreadCount;
      const readRatio = totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 100;

      // Group by Category
      const categories = ['SYSTEM', 'BOOKING', 'PAYMENT', 'EVENT'];
      const categoryCounts: Record<string, number> = {};
      for (const cat of categories) {
        categoryCounts[cat] = await prisma.notification.count({ where: { category: cat } });
      }

      // Group by Priority
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      const priorityCounts: Record<string, number> = {};
      for (const pri of priorities) {
        priorityCounts[pri] = await prisma.notification.count({ where: { priority: pri } });
      }

      // Email Logs count
      const emailSentCount = await prisma.notificationLog.count({ where: { status: 'EMAIL_SENT' } });
      const emailFailedCount = await prisma.notificationLog.count({ where: { status: 'EMAIL_FAILED' } });

      return res.json({
        totalSent,
        unreadCount,
        readCount,
        readRatio,
        byCategory: categoryCounts,
        byPriority: priorityCounts,
        emailDelivery: {
          sent: emailSentCount,
          failed: emailFailedCount,
          total: emailSentCount + emailFailedCount,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to aggregate analytics: ' + err.message });
    }
  }
}
