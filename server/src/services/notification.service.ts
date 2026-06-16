import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

// WebSocket connection registry interface
export interface ActiveWSConnection {
  send(message: string): void;
  readyState: number;
}

export class NotificationService {
  // Map of recipientId (customerId or userId) to their WebSocket connection(s)
  private static connections = new Map<string, Set<ActiveWSConnection>>();

  /**
   * Register a WebSocket connection for a given user or customer ID.
   */
  public static registerConnection(recipientId: string, ws: ActiveWSConnection) {
    if (!this.connections.has(recipientId)) {
      this.connections.set(recipientId, new Set());
    }
    this.connections.get(recipientId)!.add(ws);
    console.log(`WebSocket registered for user/customer ID: ${recipientId}`);
  }

  /**
   * Unregister a WebSocket connection.
   */
  public static unregisterConnection(recipientId: string, ws: ActiveWSConnection) {
    const userConnections = this.connections.get(recipientId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(recipientId);
      }
      console.log(`WebSocket unregistered for user/customer ID: ${recipientId}`);
    }
  }

  /**
   * Send real-time WebSocket message if the user is currently online.
   */
  private static sendRealtimeNotification(recipientId: string, notification: any) {
    const userConnections = this.connections.get(recipientId);
    if (userConnections && userConnections.size > 0) {
      const payload = JSON.stringify({
        type: 'NOTIFICATION',
        data: notification,
      });
      for (const ws of userConnections) {
        try {
          // Check connection state (1 is OPEN)
          if ((ws as any).readyState === 1) {
            ws.send(payload);
          }
        } catch (err) {
          console.error(`Error sending WS payload to ${recipientId}:`, err);
        }
      }
    }
  }

  /**
   * Simple helper to substitute template placeholders like {{variable}}
   */
  public static renderTemplate(text: string, variables: Record<string, any>): string {
    let rendered = text;
    for (const [key, val] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
    }
    return rendered;
  }

  /**
   * Send a notification to a specific customer or admin/staff user.
   */
  public static async sendNotification(options: {
    customerId?: string;
    userId?: string;
    templateName?: string;
    variables?: Record<string, any>;
    title?: string;
    message?: string;
    category?: string; // BOOKING, PAYMENT, EVENT, SYSTEM
    priority?: string; // LOW, MEDIUM, HIGH, URGENT
    type?: string; // success, warning, info
  }) {
    const { customerId, userId, templateName, variables = {}, category = 'SYSTEM', priority = 'LOW', type = 'info' } = options;
    const targetId = customerId || userId;

    if (!targetId) {
      throw new Error('Either customerId or userId must be specified.');
    }

    // 1. Resolve Recipient Email and Name
    let email = '';
    let name = '';
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer) {
        email = customer.email;
        name = customer.name;
      }
    } else if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        email = user.email;
        name = user.name;
      }
    }

    if (!email) {
      console.warn(`Could not resolve recipient details for notification target: ${targetId}`);
      return null;
    }

    // Add recipient name to variables if not present
    const renderVars = { name, ...variables };

    // 2. Fetch/Render Template or Use Direct Content
    let subject = options.title || 'New Notification';
    let body = options.message || '';

    if (templateName) {
      const template = await prisma.notificationTemplate.findUnique({ where: { name: templateName } });
      if (template) {
        subject = this.renderTemplate(template.subject, renderVars);
        body = this.renderTemplate(template.body, renderVars);
      } else {
        console.warn(`Template '${templateName}' not found. Falling back to direct input or empty content.`);
      }
    }

    // 3. Check Notification Preferences
    let emailEnabled = true;
    let inAppEnabled = true;

    const pref = await prisma.notificationPreference.findUnique({ where: { userId: targetId } });
    if (pref) {
      emailEnabled = pref.emailEnabled;
      inAppEnabled = pref.inAppEnabled;
    }

    let createdNotification = null;

    // 4. Save and Deliver inApp Notification
    if (inAppEnabled) {
      createdNotification = await prisma.notification.create({
        data: {
          customerId: customerId || null,
          userId: userId || null,
          title: subject,
          message: body,
          type,
          category,
          priority,
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          read: false,
          isRead: false,
        },
      });

      // Broadcast WebSocket
      this.sendRealtimeNotification(targetId, createdNotification);
    }

    // 5. Send Email if enabled
    if (emailEnabled) {
      const emailResult = await EmailService.sendEmail({
        to: email,
        subject,
        body,
      });

      if (createdNotification) {
        await prisma.notificationLog.create({
          data: {
            notificationId: createdNotification.id,
            status: emailResult.success ? 'EMAIL_SENT' : 'EMAIL_FAILED',
          },
        });
      }
    }

    return createdNotification;
  }

  /**
   * Broadcast notification to multiple users/customers based on role filter.
   */
  public static async broadcastNotification(options: {
    title: string;
    message: string;
    category?: string;
    priority?: string;
    targetRole?: 'OWNER' | 'MANAGER' | 'STAFF' | 'CUSTOMER' | 'ALL';
  }) {
    const { title, message, category = 'SYSTEM', priority = 'LOW', targetRole = 'ALL' } = options;
    const notificationsSent: any[] = [];

    // Fetch targets based on role
    if (targetRole === 'ALL' || targetRole === 'CUSTOMER') {
      const customers = await prisma.customer.findMany({ select: { id: true } });
      for (const customer of customers) {
        const result = await this.sendNotification({
          customerId: customer.id,
          title,
          message,
          category,
          priority,
          type: 'info',
        });
        if (result) notificationsSent.push(result);
      }
    }

    if (targetRole === 'ALL' || targetRole === 'OWNER' || targetRole === 'MANAGER' || targetRole === 'STAFF') {
      // Fetch users with matching roles
      let roleFilter = {};
      if (targetRole !== 'ALL') {
        roleFilter = { name: targetRole };
      }

      const users = await prisma.user.findMany({
        where: {
          role: roleFilter,
        },
        select: { id: true },
      });

      for (const user of users) {
        const result = await this.sendNotification({
          userId: user.id,
          title,
          message,
          category,
          priority,
          type: 'info',
        });
        if (result) notificationsSent.push(result);
      }
    }

    return notificationsSent;
  }
}
