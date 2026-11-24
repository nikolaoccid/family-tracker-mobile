import type { PermissionStatus } from 'expo-location';

export type LocationGrant = 'denied' | 'foreground' | 'background';

export interface LocationPermissionApi {
  requestForeground: () => Promise<{ status: PermissionStatus }>;
  requestBackground: () => Promise<{ status: PermissionStatus }>;
}

/**
 * Foreground permission is required; background is asked only after it and may be
 * refused, in which case the app keeps working while open ('foreground').
 * Web has no background location.
 */
export async function requestLocationGrant(api: LocationPermissionApi, isWeb: boolean): Promise<LocationGrant> {
  const foreground = await api.requestForeground();
  if (foreground.status !== 'granted') return 'denied';
  if (isWeb) return 'foreground';
  const background = await api.requestBackground();
  return background.status === 'granted' ? 'background' : 'foreground';
}
