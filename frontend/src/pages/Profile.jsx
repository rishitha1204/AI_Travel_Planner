import { useAuth } from '../hooks/useAuth.js';
import { useTrips } from '../hooks/useTrips.js';

export function Profile() {
  const { user } = useAuth();
  const { data } = useTrips({ limit: 50 });

  const tripCount = data?.trips?.length ?? 0;
  const draftCount = data?.trips?.filter((t) => t.status === 'draft').length ?? 0;

  if (!user) {
    return <div className="mx-auto max-w-md text-sm text-ink-muted">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Profile</h1>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-xl font-semibold text-primary">
            {user.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-ink-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-border pt-5">
          <div>
            <p className="data-readout text-2xl font-semibold text-ink">{tripCount}</p>
            <p className="text-xs text-ink-muted">Trips planned</p>
          </div>
          <div>
            <p className="data-readout text-2xl font-semibold text-ink">{draftCount}</p>
            <p className="text-xs text-ink-muted">In draft</p>
          </div>
          <div>
  <p className="data-readout text-2xl font-semibold text-ink">
    {data?.trips?.filter((t) => t.status === 'confirmed').length ?? 0}
  </p>
  <p className="text-xs text-ink-muted">Confirmed</p>
</div>
        </div>
      </div>
    </div>
  );
}