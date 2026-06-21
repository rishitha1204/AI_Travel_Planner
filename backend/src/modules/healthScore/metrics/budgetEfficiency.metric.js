import { clamp, round2 } from './shared.js';

const SENSITIVITY = 4;
const OVER_BUDGET_PENALTY = 20;

/**
 * Rewards a trip whose planned daily spend is evenly distributed relative
 * to the total budget; penalizes wild day-to-day swings AND, separately
 * and more harshly, exceeding the stated budget entirely -- those are
 * qualitatively different problems and the formula reflects that.
 *
 * Pure function. No Gemini import anywhere in this file or this directory.
 */
export function computeBudgetEfficiency(trip) {
  const { budget, itinerary } = trip;
  const numberOfDays = itinerary.length;

  if (numberOfDays === 0 || !budget?.total || budget.total <= 0) {
    return { score: 100, raw: { allocatedPct: 0, varianceFromIdeal: 0, note: 'No itinerary days to evaluate' } };
  }

  const dailyTotals = itinerary.map((day) =>
    day.activities.reduce((sum, activity) => sum + activity.estimatedCost, 0)
  );

  const dailyShares = dailyTotals.map((total) => total / budget.total);
  const idealShare = 1 / numberOfDays;
  const varianceFromIdeal =
    dailyShares.reduce((sum, share) => sum + Math.abs(share - idealShare), 0) / numberOfDays;
  const allocatedPct = dailyShares.reduce((sum, share) => sum + share, 0);

  let score = 100 - varianceFromIdeal * 100 * SENSITIVITY;
  const overBudget = allocatedPct > 1;
  if (overBudget) {
    score -= OVER_BUDGET_PENALTY;
  }

  return {
    score: Math.round(clamp(score, 0, 100)),
    raw: {
      allocatedPct: round2(allocatedPct),
      varianceFromIdeal: round2(varianceFromIdeal),
      overBudget,
    },
  };
}