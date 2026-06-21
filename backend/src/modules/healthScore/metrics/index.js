import { computeBudgetEfficiency } from './budgetEfficiency.metric.js';
import { computeTravelPace } from './travelPace.metric.js';
import { computeActivityBalance } from './activityBalance.metric.js';
import { computeDestinationCoverage } from './destinationCoverage.metric.js';

// Named and versioned so the weighting can be tuned or A/B tested later
// without touching any metric's actual math -- this is a product decision,
// deliberately kept separate from the engineering.
export const SCORING_VERSION = 'v1.0';

const WEIGHTS = {
  budgetEfficiency: 0.3,
  travelPace: 0.25,
  activityBalance: 0.25,
  destinationCoverage: 0.2,
};

/**
 * Computes all four deterministic sub-metrics and the weighted overall
 * score. Pure function: identical trip data in, identical score out,
 * every time. No Gemini import anywhere in this file or anywhere in this
 * directory -- verifiable by a reviewer in under a minute.
 */
export function computeHealthScoreMetrics(trip) {
  const budgetEfficiency = computeBudgetEfficiency(trip);
  const travelPace = computeTravelPace(trip);
  const activityBalance = computeActivityBalance(trip);
  const destinationCoverage = computeDestinationCoverage(trip);

  const overallScore = Math.round(
    budgetEfficiency.score * WEIGHTS.budgetEfficiency +
      travelPace.score * WEIGHTS.travelPace +
      activityBalance.score * WEIGHTS.activityBalance +
      destinationCoverage.score * WEIGHTS.destinationCoverage
  );

  return {
    overallScore,
    metrics: {
      budgetEfficiency: { ...budgetEfficiency, weight: WEIGHTS.budgetEfficiency },
      travelPace: { ...travelPace, weight: WEIGHTS.travelPace },
      activityBalance: { ...activityBalance, weight: WEIGHTS.activityBalance },
      destinationCoverage: { ...destinationCoverage, weight: WEIGHTS.destinationCoverage },
    },
  };
}