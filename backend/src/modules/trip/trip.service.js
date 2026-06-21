import { tripRepository } from './trip.repository.js';
import { ApiError } from '../../utils/ApiError.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function numberOfDays(trip) {
  return Math.round((trip.endDate - trip.startDate) / MS_PER_DAY) + 1;
}

async function listTrips(userId, { page, limit, status }) {
  const [trips, total] = await tripRepository.findAllByUser(userId, { page, limit, status });
  return {
    trips,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

function createTrip(userId, data) {
  return tripRepository.create(userId, data);
}

async function getTrip(tripId, userId) {
  const trip = await tripRepository.findByIdForUser(tripId, userId);
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }
  return trip;
}

async function updateTrip(tripId, userId, updates) {
  const trip = await tripRepository.updateByIdForUser(tripId, userId, updates);
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }
  return trip;
}

async function deleteTrip(tripId, userId) {
  const trip = await tripRepository.deleteByIdForUser(tripId, userId);
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }
}

// Finds the itinerary day a patch targets, creating it (with a computed
// calendar date) if it doesn't exist yet -- itinerary days are populated
// lazily as activities are added, rather than all being pre-created at
// trip-creation time.
function findOrCreateDay(trip, dayNumber) {
  let dayEntry = trip.itinerary.find((d) => d.day === dayNumber);

  if (!dayEntry) {
    const totalDays = numberOfDays(trip);
    if (dayNumber > totalDays) {
      throw ApiError.badRequest(`Day ${dayNumber} is outside this trip's ${totalDays}-day range`);
    }

    const date = new Date(trip.startDate);
    date.setDate(date.getDate() + (dayNumber - 1));

    trip.itinerary.push({ day: dayNumber, date, activities: [] });
    trip.itinerary.sort((a, b) => a.day - b.day);
    dayEntry = trip.itinerary.find((d) => d.day === dayNumber);
  }

  return dayEntry;
}

async function patchItinerary(tripId, userId, patch) {
  const trip = await tripRepository.findByIdForUser(tripId, userId);
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  const dayEntry = findOrCreateDay(trip, patch.day);

  switch (patch.action) {
    case 'addActivity': {
      dayEntry.activities.push(patch.activity);
      break;
    }

    case 'updateActivity': {
      const activity = dayEntry.activities.find((a) => a._id.toString() === patch.activityId);
      if (!activity) {
        throw ApiError.notFound('Activity not found on the specified day');
      }
      // NOTE: `location` is replaced wholesale if present in `updates`,
      // not deep-merged -- a partial { lat: 5 } would drop an existing
      // location.name. Acceptable for this scope; flagged here because
      // it's the one non-obvious behavior in this function.
      Object.assign(activity, patch.updates);
      break;
    }

    case 'removeActivity': {
      const exists = dayEntry.activities.some((a) => a._id.toString() === patch.activityId);
      if (!exists) {
        throw ApiError.notFound('Activity not found on the specified day');
      }
      dayEntry.activities.pull(patch.activityId);
      break;
    }

    default:
      // Unreachable given Zod's discriminated union upstream, kept as a
      // defensive guard rather than silently doing nothing.
      throw ApiError.badRequest(`Unknown itinerary action: ${patch.action}`);
  }

  await trip.save();
  return trip;
}

export const tripService = {
  listTrips,
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  patchItinerary,
};