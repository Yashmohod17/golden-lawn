import { Request, Response, NextFunction } from 'express';
import { portalService } from '../services/portal.service';
import { validateProfileUpdate, validatePaymentSimulation } from '../validations/portal.validation';

export class PortalController {
  // Helper: get customerId from header or fallback
  private async getCustomerId(req: Request): Promise<string> {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    const headerId = req.headers['x-customer-id'];
    if (headerId && typeof headerId === 'string' && headerId.trim()) {
      return headerId.trim();
    }
    return portalService.getDefaultCustomerId();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const profile = await portalService.getCustomerProfile(customerId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const { error, value } = validateProfileUpdate(req.body);
      
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const updated = await portalService.updateProfile(customerId, value);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const bookings = await portalService.getCustomerBookings(customerId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  };

  getBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const { id } = req.params;
      const details = await portalService.getBookingDetails(id, customerId);
      res.json(details);
    } catch (error) {
      next(error);
    }
  };

  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const history = await portalService.getPaymentHistory(customerId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const invoices = await portalService.getCustomerInvoices(customerId);
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  };

  simulatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const { error, value } = validatePaymentSimulation(req.body);

      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await portalService.simulatePayment(customerId, value);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const notifications = await portalService.getNotifications(customerId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  };

  markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const { id } = req.params;
      const result = await portalService.markNotificationRead(id, customerId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      await portalService.markAllNotificationsRead(customerId);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = await this.getCustomerId(req);
      const { id } = req.params;
      await portalService.deleteNotification(id, customerId);
      res.json({ success: true, message: 'Notification deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };
}

export const portalController = new PortalController();
