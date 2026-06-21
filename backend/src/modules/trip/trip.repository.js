import { Trip } from './trip.model.js';

/**
 * Every method here that touches a specific trip requires the requesting
 * user's id and filters by it DIRECTLY IN THE MONGO QUERY -- not as a
 * check performed after fetching the document. This means a missing
 * authorization check anywhere else in the codebase cannot leak another
 * user's trip data, because the query itself is structurally incapable of
 * returning it. This is a stronger guarantee than middleware-only
 * ownership checks, and is deliberate.
 */

function create(userId, data) {
  return Trip.create({ ...data, userId });
}

function findAllByUser(userId, { page, limit, status }) {
  const filter = { userId };
  if (status) filter.status = status;

  return Promise.all([
    Trip.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Trip.countDocuments(filter),
  ]);
}

function findByIdForUser(tripId, userId) {
  return Trip.findOne({ _id: tripId, userId });
}

function updateByIdForUser(tripId, userId, updates) {
  return Trip.findOneAndUpdate({ _id: tripId, userId }, updates, {
    new: true,
    runValidators: true,
  });
}

function deleteByIdForUser(tripId, userId) {
  return Trip.findOneAndDelete({ _id: tripId, userId });
}

export const tripRepository = {
  create,
  findAllByUser,
  findByIdForUser,
  updateByIdForUser,
  deleteByIdForUser,
};