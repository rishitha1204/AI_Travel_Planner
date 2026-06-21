import { getScoreTier } from '../../utils/scoreColor.js';

const METRIC_META = {
  budgetEfficiency: { label: 'Budget Efficiency', icon: '\u{1F4B0}' },
  travelPace: { label: 'Travel Pace', icon: '\u{1F557}' },
  activityBalance: { label: 'Activity Balance', icon: '\u2696\uFE0F' },
  destinationCoverage: { label: 'Destination Coverage', icon: '\u{1F4CD}' },
};

// Turns the metric's `raw` object into a one-line, plain-language stat.
// This is what visually proves the score is computed, not guessed -- a
// reviewer sees "9% over an even daily spend" under the bar, not just a
// number with no supporting detail.
function describeRaw(key, raw) {
  if (raw?.note) return raw.note;

  switch (key) {
    case 'budgetEfficiency':
      return raw.overBudget
        ? `Itinerary exceeds the planned budget (${Math.round(raw.allocatedPct * 100)}% allocated)`
        : `${Math.round(raw.varianceFromIdeal * 100)}% variance from an even daily spend`;
    case 'travelPace':
      return raw.infeasiblePairCount > 0
        ? `${raw.infeasiblePairCount} transition${raw.infeasiblePairCount > 1 ? 's' : ''} flagged as too tight`
        : `Avg ${raw.avgKmPerTransition}km between activities, comfortably paced`;
    case 'activityBalance':
      return `Dominant category: ${raw.dominantCategory}`;
    case 'destinationCoverage':
      return `${raw.uniqueAreasVisited} distinct area${raw.uniqueAreasVisited === 1 ? '' : 's'} visited`;
    default:
      return '';
  }
}

export function MetricBar({ metricKey, score, raw }) {
  const meta = METRIC_META[metricKey];
  const { color } = getScoreTier(score);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-ink">
          <span aria-hidden="true">{meta.icon}</span>
          {meta.label}
        </span>
        <span className="font-mono tabular text-ink">{score}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color, transition: 'width 0.5s ease' }}
        />
      </div>
      <p className="mt-1 text-xs text-ink-muted">{describeRaw(metricKey, raw)}</p>
    </div>
  );
}