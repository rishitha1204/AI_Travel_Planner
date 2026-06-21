import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import { tripIdParamSchema } from '../trip/trip.validation.js';
import { generateItinerarySchema } from './ai.validation.js';
import * as aiController from './ai.controller.js';

const router = Router();

router.use(requireAuth);

// aiLimiter is keyed per-user (not per-IP) -- it bounds real Gemini API
// cost exposure per account, independent of the general API rate limiter.
router.post(
  '/:tripId/generate-itinerary',
  aiLimiter,
  validateRequest(tripIdParamSchema, 'params'),
  validateRequest(generateItinerarySchema),
  aiController.generateItinerary
);

export default router;