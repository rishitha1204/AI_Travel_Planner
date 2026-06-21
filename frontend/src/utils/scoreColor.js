// Single source of truth for score -> color/label. Both OverallScoreRing
// and MetricBar import from here, so the macro and micro views can never
// drift out of sync on what counts as "good" vs "poor".
export function getScoreTier(score) {
  if (score >= 75) return { tier: 'good', color: '#0F5C57', label: 'Good' };
  if (score >= 50) return { tier: 'fair', color: '#D9A23B', label: 'Needs attention' };
  return { tier: 'poor', color: '#C1503B', label: 'Poor' };
}