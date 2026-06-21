import { Button } from '../common/Button.jsx';

export function RecalculateScoreButton({ onRecalculate, isLoading, isStale }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-ink-muted">
        {isStale
          ? 'Your itinerary changed since this score was calculated.'
          : 'Score reflects the current itinerary.'}
      </span>
      <Button variant={isStale ? 'accent' : 'secondary'} onClick={onRecalculate} isLoading={isLoading}>
        {isStale ? 'Recalculate score' : 'Recalculate'}
      </Button>
    </div>
  );
}