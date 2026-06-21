import { ACTIVITY_CATEGORIES } from '../../trip/trip.model.js';
import { clamp } from './shared.js';

/**
 * Pure function. No Gemini import anywhere in this file or this directory.
 *
 * Uses normalized Shannon entropy rather than a simpler "is one category
 * dominant" check -- entropy rewards genuine variety across many
 * categories, not just the absence of one overwhelming category, which is
 * a deliberate, slightly more nuanced modeling choice.
 */
export function computeActivityBalance(trip) {
  const counts = {};
  let total = 0;

  for (const day of trip.itinerary) {
    for (const activity of day.activities) {
      counts[activity.category] = (counts[activity.category] || 0) + 1;
      total += 1;
    }
  }

  if (total === 0) {
    return { score: 0, raw: { note: 'No activities to evaluate' } };
  }

  const categoriesUsed = Object.keys(counts);
  const numCategories = ACTIVITY_CATEGORIES.length;

  let entropy = 0;
  for (const category of categoriesUsed) {
    const p = counts[category] / total;
    entropy -= p * Math.log2(p);
  }

  const normalizedEntropy = numCategories > 1 ? entropy / Math.log2(numCategories) : 0;
  const dominantCategory = categoriesUsed.reduce((a, b) => (counts[a] >= counts[b] ? a : b));

  return {
    score: Math.round(clamp(normalizedEntropy * 100, 0, 100)),
    raw: {
      categoryEntropy: Math.round(normalizedEntropy * 100) / 100,
      dominantCategory,
      categoryDistribution: counts,
    },
  };
}