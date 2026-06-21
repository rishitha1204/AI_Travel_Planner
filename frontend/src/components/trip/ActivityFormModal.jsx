import { useState } from 'react';
import { Button } from '../common/Button.jsx';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'relaxation', 'culture', 'transport'];

export function ActivityFormModal({ initialValues, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState(
    initialValues ?? {
      time: '09:00',
      title: '',
      description: '',
      estimatedCost: 0,
      category: 'sightseeing',
      durationMinutes: 60,
    }
  );

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg">
        <h3 className="font-display text-lg font-semibold text-ink">
          {initialValues ? 'Edit activity' : 'Add activity'}
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-ink-muted">Time</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-ink-muted">Category</span>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-muted">Title</span>
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              maxLength={140}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-muted">Description (optional)</span>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-ink-muted">Cost (USD)</span>
              <input
                type="number"
                min={0}
                value={form.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', Number(e.target.value))}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-ink-muted">Duration (min)</span>
              <input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => handleChange('durationMinutes', Number(e.target.value))}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}