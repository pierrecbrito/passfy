import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { ensureAuthenticated } from '../../auth/middlewares/ensureAuthenticated';
import { ensureRole } from '../../auth/middlewares/ensureRole';

const eventRoutes = Router();

// Public routes
eventRoutes.get('/', EventController.list);
eventRoutes.get('/:id', EventController.getById);

// Organizer protected routes
eventRoutes.post(
  '/',
  ensureAuthenticated,
  ensureRole(['ORGANIZER']),
  EventController.create
);

eventRoutes.get(
  '/organizer/my-events',
  ensureAuthenticated,
  ensureRole(['ORGANIZER']),
  EventController.getMyEvents
);

export { eventRoutes };
