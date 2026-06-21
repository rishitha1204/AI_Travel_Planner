export function Spinner({ size = 24, className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-primary/20 border-t-primary ${className}`}
      style={{ width: size, height: size }}
    />
  );
}