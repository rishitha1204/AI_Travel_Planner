const UNIT_TO_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses simple duration strings like "15m", "7d", "30s" into milliseconds.
 * Deliberately minimal — only supports the exact suffixes this project's
 * JWT expiry config uses, rather than pulling in a full duration-parsing
 * dependency for one cookie maxAge calculation.
 */
export function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected e.g. "15m" or "7d".`);
  }

  const [, value, unit] = match;
  return Number(value) * UNIT_TO_MS[unit];
}