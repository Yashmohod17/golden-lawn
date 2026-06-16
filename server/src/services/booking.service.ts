import { bookingRepository } from '../repositories/booking.repository';
import { BookingInput } from '../validations/booking.validation';

export class BookingService {
  async getBookings() {
    return bookingRepository.getAll();
  }

  async createBooking(data: BookingInput) {
    return bookingRepository.create(data);
  }

  async updateBooking(id: string, data: any, changedBy = 'COORDINATOR') {
    return bookingRepository.update(id, data, changedBy);
  }

  async updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED', changedBy = 'COORDINATOR') {
    return bookingRepository.update(id, { status }, changedBy);
  }

  async cancelBooking(id: string, changedBy = 'COORDINATOR') {
    return bookingRepository.update(id, { status: 'CANCELLED' }, changedBy);
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
