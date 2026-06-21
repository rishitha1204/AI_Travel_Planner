export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-border/70 ${className}`} aria-hidden="true" />;
}