import { Router } from 'express';
import {
  calculateBillPreview,
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Preview bill calculation (can be accessed by authenticated user)
router.post('/calculate', authMiddleware, calculateBillPreview);

// Booking actions
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);

export default router;
