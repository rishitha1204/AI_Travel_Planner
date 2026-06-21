import { haversineDistanceKm } from '../../../utils/geoMath.js';
import { clamp, round2 } from './shared.js';

// Coarse urban-travel assumption -- ignores transit mode (walking, driving,
// public transport) entirely. This is the one deliberate simplification in
// this metric: a more rigorous version would let the user specify a mode
// per day, or call a real routing API for actual travel-time estimates.
const ASSUMED_AVG_SPEED_KMH = 25;

// Used when there's no coordinate data to evaluate at all -- a neutral,
// slightly-favorable default rather than penalizing a trip we simply
// cannot assess (no information should not look identical to "bad").
const DEFAULT_SCORE_WHEN_NO_DATA = 75;

function timeToMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Pure function. No Gemini import anywhere in this file or this directory.
 * Activities without lat/lng are skipped (not penalized) when forming
 * consecutive pairs -- see the module-level note on AI-generated activities
 * in trip.model.js: Gemini proposes places by name only, so this metric is
 * naturally most accurate for manually-added activities with coordinates.
 */
export function computeTravelPace(trip) {
  const pairScores = [];
  let totalDistanceKm = 0;
  let maxGapShortfallMinutes = 0;

  for (const day of trip.itinerary) {
    const sorted = [...day.activities].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    for (let i = 0; i < sorted.length - 1; i += 1) {
      const a = sorted[i];
      const b = sorted[i + 1];

      const coordA = a.location?.lat != null ? { lat: a.location.lat, lng: a.location.lng } : null;
      const coordB = b.location?.lat != null ? { lat: b.location.lat, lng: b.location.lng } : null;
      const distanceKm = coordA && coordB ? haversineDistanceKm(coordA, coordB) : null;
      if (distanceKm == null) continue;

      const estimatedTravelMinutes = Math.max((distanceKm / ASSUMED_AVG_SPEED_KMH) * 60, 1);
      const availableMinutes = timeToMinutes(b.time) - (timeToMinutes(a.time) + a.durationMinutes);
      const gapRatio = availableMinutes / estimatedTravelMinutes;

      let pairScore;
      if (gapRatio >= 1.5) pairScore = 100;
      else if (gapRatio >= 1) pairScore = 70 + (gapRatio - 1) * 60;
      else pairScore = Math.max(0, gapRatio * 70);

      pairScores.push(pairScore);
      totalDistanceKm += distanceKm;

      if (gapRatio < 1) {
        maxGapShortfallMinutes = Math.max(maxGapShortfallMinutes, estimatedTravelMinutes - availableMinutes);
      }
    }
  }

  if (pairScores.length === 0) {
    return {
      score: DEFAULT_SCORE_WHEN_NO_DATA,
      raw: {
        evaluablePairs: 0,
        note: 'No activities had coordinates to evaluate travel time between them; score defaulted rather than penalized.',
      },
    };
  }

  const score = clamp(pairScores.reduce((sum, s) => sum + s, 0) / pairScores.length, 0, 100);

  return {
    score: Math.round(score),
    raw: {
      evaluablePairs: pairScores.length,
      avgKmPerTransition: round2(totalDistanceKm / pairScores.length),
      maxGapShortfallMinutes: Math.round(maxGapShortfallMinutes),
      infeasiblePairCount: pairScores.filter((s) => s < 70).length,
    },
  };
}