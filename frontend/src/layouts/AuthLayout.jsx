import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold tracking-tight text-primary">
            Voyage
          </span>
          <p className="mt-2 text-sm text-ink-muted">
            AI-planned trips, explained in plain numbers.
          </p>
        </div>
        <div className="relative rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <div className="absolute left-0 top-10 h-3 w-3 -translate-x-1/2 rounded-full bg-bg" />
          <div className="absolute right-0 top-10 h-3 w-3 translate-x-1/2 rounded-full bg-bg" />
          <Outlet />
        </div>
      </div>
    </div>
  );
}