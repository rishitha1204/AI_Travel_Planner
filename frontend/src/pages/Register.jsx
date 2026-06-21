import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/common/Button.jsx';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="font-display text-lg font-semibold text-ink">Create your account</h1>
      {error && <p className="rounded-lg bg-score-poor/10 px-3 py-2 text-sm text-score-poor">{error}</p>}
      <label className="block text-sm">
        <span className="mb-1 block text-ink-muted">Name</span>
        <input
          required
          minLength={2}
          maxLength={80}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-muted">Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-muted">Password</span>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-ink-muted">At least 8 characters, with a letter and a number.</span>
      </label>
      <Button type="submit" isLoading={isLoading} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}