import { tripRepository } from '../trip/trip.repository.js';
import { healthScoreRepository } from './healthScore.repository.js';
import { computeHealthScoreMetrics, SCORING_VERSION } from './metrics/index.js';
import { geminiService, AIError } from '../ai/gemini.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

/**
 * The orchestration sequence here is the entire point of this feature:
 *
 *  1. Compute the deterministic score from the trip's itinerary.
 *  2. PERSIST IT, before Gemini is ever called.
 *  3. Only then attempt an explanation, passing Gemini nothing but the
 *     already-computed metrics object.
 *  4. If the explanation fails for any reason, the score that's already
 *     saved is untouched and still returned successfully -- a Gemini
 *     outage degrades only the narration, never the number.
 */
async function generate(tripId, userId, requestId) {
  console.log('--- HEALTH SCORE START ---');
  console.log('tripId:', tripId);
  console.log('userId:', userId);

  const trip = await tripRepository.findByIdForUser(tripId, userId);
  console.log('Trip found:', trip);

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  console.log('Trip itinerary:', trip.itinerary);

  if (trip.itinerary.length === 0) {
    throw ApiError.badRequest(
      'This trip has no itinerary yet -- generate or add activities before computing a health score'
    );
  }

  let computed;
  try {
    computed = computeHealthScoreMetrics(trip);
    console.log('Computed score result:', computed);
  } catch (err) {
    console.error('ERROR inside computeHealthScoreMetrics:', err);
    throw err;
  }

  const { overallScore, metrics } = computed;

  let scoreDoc;
  try {
    scoreDoc = await healthScoreRepository.create({
      tripId: trip._id,
      userId: trip.userId,
      overallScore,
      metrics,
      scoringVersion: SCORING_VERSION,
      explanation: { status: 'pending' },
    });
    console.log('Score document created:', scoreDoc);
  } catch (err) {
    console.error('ERROR while saving score document:', err);
    throw err;
  }

  try {
    console.log('Calling Gemini explanation...');
    const explanation = await geminiService.explainHealthScore(metrics, { requestId });

    console.log('Gemini explanation response:', explanation);

    scoreDoc.explanation = {
      summary: explanation.summary,
      recommendations: explanation.recommendations,
      modelUsed: env.gemini.model,
      generatedAt: new Date(),
      status: 'success',
    };
  } catch (err) {
    console.error('Gemini explanation error:', err);

    if (!(err instanceof AIError)) {
      console.error('This is NOT an AIError, so it will crash the request');
      throw err;
    }

    logger.warn(
      { requestId, reason: err.constructor.name },
      'Health score explanation failed -- the score itself is still valid and unaffected'
    );

    scoreDoc.explanation = {
      status: 'failed',
      errorReason: err.constructor.name,
      generatedAt: new Date(),
    };
  }

  try {
    await scoreDoc.save();
    console.log('Final score saved successfully');
  } catch (err) {
    console.error('ERROR while final save:', err);
    throw err;
  }

  console.log('--- HEALTH SCORE END ---');
  return scoreDoc;
}
async function getLatest(tripId, userId) {
  const score = await healthScoreRepository.findLatestForTrip(tripId, userId);
  if (!score) {
    throw ApiError.notFound('No health score has been computed for this trip yet');
  }
  return score;
}

function getHistory(tripId, userId) {
  return healthScoreRepository.findHistoryForTrip(tripId, userId);
}

async function getById(tripId, scoreId, userId) {
  const score = await healthScoreRepository.findByIdForUser(scoreId, userId);
  if (!score || String(score.tripId) !== String(tripId)) {
    throw ApiError.notFound('Health score not found');
  }
  return score;
}

export const healthScoreService = { generate, getLatest, getHistory, getById };