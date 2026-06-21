export function ScoreExplanationPanel({ explanation }) {
  if (!explanation || explanation.status === 'pending') return null;

  if (explanation.status === 'failed') {
    return (
      <div className="rounded-lg border border-dashed border-border bg-bg px-4 py-3 text-sm text-ink-muted">
        We couldn't generate a written explanation this time, but the score above is computed independently and
        is fully valid.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-primary-light px-4 py-3">
      <p className="text-sm text-ink">{explanation.summary}</p>
      {explanation.recommendations?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {explanation.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="text-primary" aria-hidden="true">
                &bull;
              </span>
              {rec}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}