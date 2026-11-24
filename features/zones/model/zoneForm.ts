import type { NewSafeZone, SafeZone } from './zone';

export const RADIUS_MIN_M = 50;
export const RADIUS_MAX_M = 5000;
export const DEFAULT_RADIUS_M = 200;

/** Shown until the device position is known (Eiffel Tower, a public landmark). */
export const DEFAULT_CENTER = { latitude: 48.8584, longitude: 2.2945 };

export interface ZoneFormValues {
  name: string;
  radius: string;
  color: string;
  members: string[];
  center: { latitude: number; longitude: number };
  isActive: boolean;
}

export type ZoneFormErrors = Partial<Record<'name' | 'radius', string>>;

export function validateZoneForm(values: Pick<ZoneFormValues, 'name' | 'radius'>): ZoneFormErrors {
  const errors: ZoneFormErrors = {};
  if (!values.name.trim()) errors.name = 'Zone name is required';
  const radius = Number.parseInt(values.radius, 10);
  if (Number.isNaN(radius) || radius < RADIUS_MIN_M || radius > RADIUS_MAX_M) {
    errors.radius = `Radius must be between ${RADIUS_MIN_M} and ${RADIUS_MAX_M} meters`;
  }
  return errors;
}

export function toNewZone(values: ZoneFormValues): NewSafeZone {
  return {
    name: values.name.trim(),
    color: values.color,
    radius: Number.parseInt(values.radius, 10),
    centerLatitude: values.center.latitude,
    centerLongitude: values.center.longitude,
    membersToTrack: values.members,
    isActive: values.isActive,
  };
}

export function formFromZone(zone: SafeZone): ZoneFormValues {
  return {
    name: zone.name,
    radius: String(zone.radius),
    color: zone.color,
    members: zone.membersToTrack,
    center: { latitude: zone.centerLatitude, longitude: zone.centerLongitude },
    isActive: zone.isActive,
  };
}

export const toggleMember = (members: readonly string[], id: string): string[] =>
  members.includes(id) ? members.filter((m) => m !== id) : [...members, id];
