const CATEGORY_ICON = {
  sightseeing: '\u{1F3DB}\uFE0F',
  food: '\u{1F37D}\uFE0F',
  adventure: '\u{1F9ED}',
  relaxation: '\u{1F3D6}\uFE0F',
  culture: '\u{1F3AD}',
  transport: '\u{1F68C}',
};

export function ActivityCard({ activity, onEdit, onRemove }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <div className="flex gap-3">
        <span className="font-mono tabular text-sm text-ink-muted">{activity.time}</span>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <span aria-hidden="true">{CATEGORY_ICON[activity.category]}</span>
            {activity.title}
            {activity.source === 'ai' && (
              <span className="rounded-full bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent-dark">
                AI
              </span>
            )}
          </p>
          {activity.description && <p className="text-xs text-ink-muted">{activity.description}</p>}
          <p className="mt-0.5 font-mono tabular text-xs text-ink-muted">
            ${activity.estimatedCost} &middot; {activity.durationMinutes} min
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={onEdit} className="text-xs text-ink-muted hover:text-primary">
          Edit
        </button>
        <button onClick={onRemove} className="text-xs text-ink-muted hover:text-score-poor">
          Remove
        </button>
      </div>
    </div>
  );
}