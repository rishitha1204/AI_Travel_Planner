import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '../hooks/useTrips.js';
import { Button } from '../components/common/Button.jsx';

export function CreateTrip() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const [form, setForm] = useState({
    title: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    budgetTotal: '',
    currency: 'USD',
  });
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const trip = await createTrip.mutateAsync({
        title: form.title,
        destination: { city: form.city, country: form.country },
        startDate: form.startDate,
        endDate: form.endDate,
        budget: { total: Number(form.budgetTotal), currency: form.currency },
      });
      navigate(`/trips/${trip._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Could not create the trip. Check the form and try again.');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Plan a new trip</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
        {error && <p className="rounded-lg bg-score-poor/10 px-3 py-2 text-sm text-score-poor">{error}</p>}

        <label className="block text-sm">
          <span className="mb-1 block text-ink-muted">Trip title</span>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Tokyo Adventure"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">City</span>
            <input
              required
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">Country</span>
            <input
              required
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">Start date</span>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">End date</span>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-ink-muted">Budget total</span>
            <input
              type="number"
              min={0}
              required
              value={form.budgetTotal}
              onChange={(e) => update('budgetTotal', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="w-28 text-sm">
            <span className="mb-1 block text-ink-muted">Currency</span>
            <input
              required
              maxLength={3}
              value={form.currency}
              onChange={(e) => update('currency', e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase"
            />
          </label>
        </div>

        <Button type="submit" isLoading={createTrip.isPending} className="w-full">
          Create trip
        </Button>
      </form>
    </div>
  );
}