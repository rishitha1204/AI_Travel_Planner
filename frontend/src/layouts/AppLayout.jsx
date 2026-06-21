import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u2302' },
  { to: '/trips/new', label: 'New trip', icon: '\u002B' },
  { to: '/profile', label: 'Profile', icon: '\u25CB' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-16 flex-col items-center gap-1 border-r border-border bg-surface py-6 sm:w-60 sm:items-stretch sm:px-4">
        <div className="mb-8 px-2 text-center sm:text-left">
          <span className="font-display text-xl font-semibold tracking-tight text-primary">
            Voyage
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                }`
              }
            >
              <span aria-hidden="true" className="text-base">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <span aria-hidden="true">&larr;</span>
          <span className="hidden sm:inline">Log out</span>
        </button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border bg-surface px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
              {user?.email?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm text-ink-muted">{user?.email}</span>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}