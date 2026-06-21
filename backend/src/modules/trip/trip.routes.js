import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createTripSchema,
  updateTripSchema,
  tripListQuerySchema,
  tripIdParamSchema,
  itineraryPatchSchema,
} from './trip.validation.js';
import * as tripController from './trip.controller.js';

const router = Router();

// Every route in this file requires a valid access token -- trips have no
// public-read concept, so this is applied once at the router level rather
// than per-route.
router.use(requireAuth);

router.get('/', validateRequest(tripListQuerySchema, 'query'), tripController.listTrips);
router.post('/', validateRequest(createTripSchema), tripController.createTrip);

router.get('/:tripId', validateRequest(tripIdParamSchema, 'params'), tripController.getTrip);

router.put(
  '/:tripId',
  validateRequest(tripIdParamSchema, 'params'),
  validateRequest(updateTripSchema),
  tripController.updateTrip
);

router.delete('/:tripId', validateRequest(tripIdParamSchema, 'params'), tripController.deleteTrip);

router.patch(
  '/:tripId/itinerary',
  validateRequest(tripIdParamSchema, 'params'),
  validateRequest(itineraryPatchSchema),
  tripController.patchItinerary
);

export default router;