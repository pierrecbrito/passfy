import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { ensureAuthenticated } from '../../auth/middlewares/ensureAuthenticated';

const bookingRoutes = Router();

bookingRoutes.post('/simulate', ensureAuthenticated, BookingController.simulateCheckout);

export { bookingRoutes };
