import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';
import { ensureAuthenticated } from '../../auth/middlewares/ensureAuthenticated';

const ticketRoutes = Router();

// Public shareable link
ticketRoutes.get('/share/:shareToken', TicketController.getShareable);

// Customer protected routes
ticketRoutes.get('/me', ensureAuthenticated, TicketController.getMyTickets);
ticketRoutes.get('/:id', ensureAuthenticated, TicketController.getById);

export { ticketRoutes };
