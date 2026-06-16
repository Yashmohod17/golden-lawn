import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { validateBookingInput, validateBookingUpdate } from '../validations/booking.validation';

function getChangedBy(req: Request): string {
  if (req.user && req.user.role) {
    return req.user.role;
  }
  const headerId = req.headers['x-customer-id'];
  if (headerId) {
    return 'CUSTOMER';
  }
  return 'COORDINATOR';
}

export class BookingController {
  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingService.getBookings();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validateBookingInput(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const booking = await bookingService.createBooking(value);
      res.status(201).json(booking);
    } catch (error: any) {
      if (error.message && error.message.includes('already booked')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  async updateBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = validateBookingUpdate(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const changer = getChangedBy(req);
      const booking = await bookingService.updateBooking(id, value, changer);
      res.json(booking);
    } catch (error: any) {
      if (error.message && (
        error.message.includes('already booked') || 
        error.message.includes('not found') ||
        error.message.includes('downgrade') ||
        error.message.includes('Past bookings')
      )) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid or missing status value.' });
      }

      const changer = getChangedBy(req);
      const booking = await bookingService.updateBookingStatus(id, status, changer);
      res.json(booking);
    } catch (error: any) {
      if (error.message && (error.message.includes('already booked') || error.message.includes('not found'))) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const changer = getChangedBy(req);
      const booking = await bookingService.cancelBooking(id, changer);
      res.json(booking);
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async getBookingStatusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await bookingService.getStatusHistory(id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async getBookingTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const timeline = await bookingService.getTimelineEvents(id);
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  }

  async deleteBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await bookingService.deleteBooking(id);
      res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
