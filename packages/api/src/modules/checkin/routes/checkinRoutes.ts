import { Router } from 'express';
import { CheckinController } from '../controllers/CheckinController';
import { ensureAuthenticated } from '../../auth/middlewares/ensureAuthenticated';
import { ensureRole } from '../../auth/middlewares/ensureRole';

const checkinRoutes = Router();

checkinRoutes.post(
  '/validate',
  ensureAuthenticated,
  ensureRole(['GATEKEEPER', 'ORGANIZER']),
  CheckinController.validate
);

export { checkinRoutes };
