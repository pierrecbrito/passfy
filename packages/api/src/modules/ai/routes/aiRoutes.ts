import { Router } from 'express';
import { AiController } from '../controllers/AiController';

const aiRoutes = Router();

aiRoutes.post('/concierge', AiController.recommend);
aiRoutes.post('/recommend', AiController.recommend);

export { aiRoutes };
