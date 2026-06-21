export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}