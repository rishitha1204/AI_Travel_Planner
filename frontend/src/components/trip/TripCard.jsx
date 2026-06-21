import { Link } from 'react-router-dom';

export function TripCard({ trip }) {
  const dateRange = `${new Date(trip.startDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} \u2013 ${new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  const nights = Math.max(
    1,
    Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
  );

  return (
    <Link
      to={`/trips/${trip._id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2 p-4">
        <div>
          <p className="data-readout text-[11px] uppercase tracking-widest text-accent">
            Trip &middot; {trip.status}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">{trip.title}</h3>
          <p className="text-sm text-ink-muted">
            {trip.destination.city}, {trip.destination.country}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium capitalize text-primary">
          {trip.status}
        </span>
      </div>

      {/* Perforated ticket-stub divider */}
      <div className="relative px-4">
        <div className="border-t border-dashed border-border" />
        <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-bg" />
        <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-bg" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <p className="data-readout text-xs text-ink-muted">{dateRange}</p>
        <p className="data-readout text-xs text-ink-muted">
          {nights} {nights === 1 ? 'night' : 'nights'}
        </p>
      </div>
    </Link>
  );
}