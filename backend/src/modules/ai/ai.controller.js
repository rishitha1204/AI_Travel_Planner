import { aiService } from './ai.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const generateItinerary = catchAsync(async (req, res) => {
  const { trip, costReconciliation } = await aiService.generateItineraryForTrip(
    req.params.tripId,
    req.user.id,
    req.body,
    req.requestId
  );
  res.status(200).json({ success: true, data: { trip, costReconciliation } });
});