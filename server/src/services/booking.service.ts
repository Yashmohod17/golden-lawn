import { bookingRepository } from '../repositories/booking.repository';
import { BookingInput } from '../validations/booking.validation';
import { NotificationService } from './notification.service';

export class BookingService {
  async getBookings() {
    return bookingRepository.getAll();
  }

  async createBooking(data: BookingInput) {
    const booking = await bookingRepository.create(data);
    if (booking.customerId) {
      try {
        await NotificationService.sendNotification({
          customerId: booking.customerId,
          templateName: 'booking_confirmation',
          variables: {
            eventType: booking.eventType,
            date: booking.date,
            bookingId: booking.id
          },
          category: 'BOOKING',
          priority: 'HIGH',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to dispatch booking creation notification:', err);
      }
    }
    return booking;
  }

  async updateBooking(id: string, data: any, changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, data, changedBy);
    if (booking.customerId) {
      try {
        if (data.status === 'CONFIRMED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_confirmation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'HIGH',
            type: 'success'
          });
        } else if (data.status === 'CANCELLED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_cancellation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'URGENT',
            type: 'warning'
          });
        } else {
          // General config changes
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            title: 'Booking Details Updated',
            message: `Your booking details for ${booking.eventType} on ${booking.date} have been updated.`,
            category: 'BOOKING',
            priority: 'MEDIUM',
            type: 'info'
          });
        }
      } catch (err) {
        console.error('Failed to dispatch booking update notification:', err);
      }
    }
    return booking;
  }

  async updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED', changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, { status }, changedBy);
    if (booking.customerId) {
      try {
        if (status === 'CONFIRMED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_confirmation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'HIGH',
            type: 'success'
          });
        } else if (status === 'CANCELLED') {
          await NotificationService.sendNotification({
            customerId: booking.customerId,
            templateName: 'booking_cancellation',
            variables: {
              eventType: booking.eventType,
              date: booking.date,
              bookingId: booking.id
            },
            category: 'BOOKING',
            priority: 'URGENT',
            type: 'warning'
          });
        }
      } catch (err) {
        console.error('Failed to dispatch booking status update notification:', err);
      }
    }
    return booking;
  }

  async cancelBooking(id: string, changedBy = 'COORDINATOR') {
    const booking = await bookingRepository.update(id, { status: 'CANCELLED' }, changedBy);
    if (booking.customerId) {
      try {
        await NotificationService.sendNotification({
          customerId: booking.customerId,
          templateName: 'booking_cancellation',
          variables: {
            eventType: booking.eventType,
            date: booking.date,
            bookingId: booking.id
          },
          category: 'BOOKING',
          priority: 'URGENT',
          type: 'warning'
        });
      } catch (err) {
        console.error('Failed to dispatch booking cancel notification:', err);
      }
    }
    return booking;
  }

  async getStatusHistory(bookingId: string) {
    return bookingRepository.getStatusHistory(bookingId);
  }

  async getTimelineEvents(bookingId: string) {
    return bookingRepository.getTimelineEvents(bookingId);
  }

  async deleteBooking(id: string) {
    return bookingRepository.delete(id);
  }
}

export const bookingService = new BookingService();
