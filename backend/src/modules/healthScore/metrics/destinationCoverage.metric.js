import { clamp, round2 } from './shared.js';

// Coarse grid-snap "clustering" -- 2 decimal places of lat/lng is
// approximately a 1.1km cell at the equator. This is a deliberate
// simplification (no real clustering algorithm, no routing data), good
// enough to distinguish "same neighborhood" from "across town" but not
// precise.
const GRID_PRECISION = 2;
const EXPECTED_AREAS_PER_DAY = 1.5;

// Used when there's no coordinate data at all -- see travelPace.metric.js
// for the same reasoning: no information should default to neutral, not
// to a penalty.
const DEFAULT_SCORE_WHEN_NO_DATA = 75;

/**
 * Pure function. No Gemini import anywhere in this file or this directory.
 */
export function computeDestinationCoverage(trip) {
  const cells = new Set();
  let withCoords = 0;
  let total = 0;

  for (const day of trip.itinerary) {
    for (const activity of day.activities) {
      total += 1;
      if (activity.location?.lat != null && activity.location?.lng != null) {
        withCoords += 1;
        cells.add(`${activity.location.lat.toFixed(GRID_PRECISION)},${activity.location.lng.toFixed(GRID_PRECISION)}`);
      }
    }
  }

  if (withCoords === 0) {
    return {
      score: DEFAULT_SCORE_WHEN_NO_DATA,
      raw: {
        uniqueAreasVisited: null,
        note: 'No activities had coordinates to cluster; score defaulted rather than penalized.',
      },
    };
  }

  const uniqueAreasVisited = cells.size;
  const areaRevisitRate = clamp((withCoords - uniqueAreasVisited) / withCoords, 0, 1);
  const numberOfDays = trip.itinerary.length || 1;
  const expectedAreas = EXPECTED_AREAS_PER_DAY * numberOfDays;

  const score = clamp((uniqueAreasVisited / expectedAreas) * 100 * (1 - areaRevisitRate), 0, 100);

  return {
    score: Math.round(score),
    raw: {
      uniqueAreasVisited,
      areaRevisitRate: round2(areaRevisitRate),
      coordinateCoverage: round2(withCoords / total),
    },
  };
}