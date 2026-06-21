import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips.js';
import { TripCard } from '../components/trip/TripCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { Button } from '../components/common/Button.jsx';

export function Dashboard() {
  const { data, isLoading, isError } = useTrips({ limit: 12 });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Your trips</h1>
        <Link to="/trips/new">
          <Button>+ New trip</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-score-poor">Couldn't load your trips. Please refresh.</p>}

      {data && data.trips.length === 0 && (
        <EmptyState
          title="No trips yet"
          description="Create your first trip and let the AI build an itinerary in seconds."
          action={
            <Link to="/trips/new">
              <Button>Create your first trip</Button>
            </Link>
          }
        />
      )}

      {data && data.trips.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}