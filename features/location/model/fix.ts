import type { LocationObject } from 'expo-location';
import type { Location } from './location';

/** Maps a device fix to the wire shape. Null sensor readings become absent fields. */
export function toLocation(fix: Pick<LocationObject, 'coords'>, now: Date = new Date()): Location {
  const { latitude, longitude, accuracy, speed, heading } = fix.coords;
  return {
    latitude,
    longitude,
    timestamp: now.toISOString(),
    accuracy: accuracy ?? undefined,
    speed: speed ?? undefined,
    heading: heading ?? undefined,
  };
}
