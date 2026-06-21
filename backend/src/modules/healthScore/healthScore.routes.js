import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import { tripIdParamSchema } from '../trip/trip.validation.js';
import { tripAndScoreIdParamSchema } from './healthScore.validation.js';
import * as healthScoreController from './healthScore.controller.js';

const router = Router();

router.use(requireAuth);

// Shares the per-user aiLimiter with itinerary generation -- computing a
// score triggers a real Gemini explanation call, so it draws from the
// same AI-cost quota.
router.post(
  '/:tripId/health-score',
  aiLimiter,
  validateRequest(tripIdParamSchema, 'params'),
  healthScoreController.computeScore
);

router.get('/:tripId/health-score', validateRequest(tripIdParamSchema, 'params'), healthScoreController.getLatestScore);

// NOTE: this static '/history' route MUST be registered before the dynamic
// '/:scoreId' route below -- Express matches in registration order, and a
// dynamic param route registered first would swallow "history" as if it
// were a scoreId.
router.get(
  '/:tripId/health-score/history',
  validateRequest(tripIdParamSchema, 'params'),
  healthScoreController.getScoreHistory
);

router.get(
  '/:tripId/health-score/:scoreId',
  validateRequest(tripAndScoreIdParamSchema, 'params'),
  healthScoreController.getScoreById
);

export default router;