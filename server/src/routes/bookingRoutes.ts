import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { validateQuery, validateBody } from '../middleware/validator.js';
import { BookingQuerySchema, CreateBookingSchema, UpdateBookingStatusSchema } from '../types/index.js';

const router = Router();

router.get('/', validateQuery(BookingQuerySchema), BookingController.getBookings);
router.get('/:id', BookingController.getBookingById);
router.post('/', validateBody(CreateBookingSchema), BookingController.createBooking);
router.patch('/:id/status', validateBody(UpdateBookingStatusSchema), BookingController.updateBookingStatus);

export default router;
