const EARTH_RADIUS_M = 6_371_000;

export interface Coordinate {
  latitude: number;
  longitude: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres (haversine). */
export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface CircularZone {
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  isActive: boolean;
}

/** A point on the boundary counts as inside. Inactive zones never contain anything. */
export function isInsideZone(point: Coordinate, zone: CircularZone): boolean {
  if (!zone.isActive) return false;
  const center = { latitude: zone.centerLatitude, longitude: zone.centerLongitude };
  return distanceMeters(point, center) <= zone.radius;
}

export function zonesContaining<Z extends CircularZone>(point: Coordinate, zones: readonly Z[]): Z[] {
  return zones.filter((zone) => isInsideZone(point, zone));
}
