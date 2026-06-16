import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';

const router = Router();

router.get('/bookings', bookingController.getBookings);
router.post('/bookings', bookingController.createBooking);
router.post('/contact', bookingController.createBooking); // Alias for frontend inquiry submission
router.patch('/bookings/:id', bookingController.updateBooking);
router.post('/bookings/:id/cancel', bookingController.cancelBooking);
router.get('/bookings/:id/status-history', bookingController.getBookingStatusHistory);
router.get('/bookings/:id/timeline', bookingController.getBookingTimeline);
router.delete('/bookings/:id', bookingController.deleteBooking);

export default router;
