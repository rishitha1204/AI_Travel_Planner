import { tripRepository } from '../trip/trip.repository.js';
import { geminiService, AIError } from './gemini.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function numberOfDays(trip) {
  return Math.round((trip.endDate - trip.startDate) / MS_PER_DAY) + 1;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function generateItineraryForTrip(tripId, userId, { preferences, pace }, requestId) {
  const trip = await tripRepository.findByIdForUser(tripId, userId);
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  let generated;
  try {
    generated = await geminiService.generateItinerary(
      {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        numberOfDays: numberOfDays(trip),
        budget: trip.budget,
        preferences,
        pace,
      },
      { requestId }
    );
  } catch (err) {
    if (err instanceof AIError) {
      logger.error(
        { requestId, reason: err.constructor.name, message: err.message },
        'Itinerary generation failed after retries'
      );
      // 400, not 500: this is a known, expected failure mode (AI
      // unavailable or persistently misbehaving), not a server bug, and the
      // client should treat it as retryable rather than as "something
      // broke on our end".
      throw ApiError.badRequest('AI itinerary generation failed, please try again shortly', {
        reason: err.constructor.name,
      });
    }
    throw err;
  }

  // Replace the trip's itinerary wholesale with the freshly generated one.
  // Every activity is tagged source: 'ai', distinguishing it from
  // manually-added activities created via Phase 3's itinerary PATCH
  // endpoint, which default to source: 'user'.
  trip.itinerary = generated.days.map((day) => ({
    day: day.day,
    date: addDays(trip.startDate, day.day - 1),
    activities: day.activities.map((activity) => ({ ...activity, source: 'ai' })),
  }));

  await trip.save();

  return { trip, costReconciliation: generated.costReconciliation };
}

export const aiService = {
  generateItineraryForTrip,
};