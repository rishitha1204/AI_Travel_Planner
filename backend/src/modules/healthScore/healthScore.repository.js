import { TripHealthScore } from './healthScore.model.js';

function create(data) {
  return TripHealthScore.create(data);
}

function findLatestForTrip(tripId, userId) {
  return TripHealthScore.findOne({ tripId, userId }).sort({ createdAt: -1 });
}

function findHistoryForTrip(tripId, userId) {
  return TripHealthScore.find({ tripId, userId }).sort({ createdAt: -1 });
}

function findByIdForUser(scoreId, userId) {
  return TripHealthScore.findOne({ _id: scoreId, userId });
}

export const healthScoreRepository = {
  create,
  findLatestForTrip,
  findHistoryForTrip,
  findByIdForUser,
};