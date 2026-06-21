import { ActivityCard } from './ActivityCard.jsx';

export function ItineraryDayCard({ day, onAddActivity, onEditActivity, onRemoveActivity }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-surface">
      {/* The ticket stub -- the one signature element this app is built
          around. A dashed perforation separates the day number from the
          activity list, like a boarding pass stub. */}
      <div className="flex w-20 flex-col items-center justify-center border-r border-dashed border-border bg-primary-light px-2 py-4">
        <span className="font-mono text-[10px] tracking-wide text-primary/70">DAY</span>
        <span className="font-display text-2xl font-bold text-primary">{String(day.day).padStart(2, '0')}</span>
        <span className="mt-1 font-mono text-[10px] text-primary/70">
          {day.date ? new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
        </span>
      </div>

      <div className="flex-1 space-y-2 p-4">
        {day.activities.length === 0 && <p className="text-sm text-ink-muted">No activities yet for this day.</p>}
        {day.activities.map((activity) => (
          <ActivityCard
            key={activity._id}
            activity={activity}
            onEdit={() => onEditActivity(day.day, activity)}
            onRemove={() => onRemoveActivity(day.day, activity._id)}
          />
        ))}
        <button onClick={() => onAddActivity(day.day)} className="text-sm font-medium text-primary hover:underline">
          + Add activity
        </button>
      </div>
    </div>
  );
}