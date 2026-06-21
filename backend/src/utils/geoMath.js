const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine great-circle distance between two lat/lng points, in km.
 * Returns null if either point is missing coordinates -- callers must
 * handle that explicitly rather than receiving a fabricated distance.
 */
export function haversineDistanceKm(a, b) {
  if (a?.lat == null || a?.lng == null || b?.lat == null || b?.lng == null) {
    return null;
  }

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}