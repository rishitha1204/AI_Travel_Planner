import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/common/Button.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Log in to keep planning your trip.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-score-poor/10 px-3 py-2 text-sm text-score-poor">{error}</p>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary"
        />
      </label>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Log in
      </Button>

      <p className="text-center text-sm text-ink-muted">
        No account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}