import {SafeZone} from "@/types";

export const mapSafeZoneToBackendFormat = (safeZone: SafeZone, familyId: string) => {
  return {
    id: safeZone.id,
    name: safeZone.name,
    color: safeZone.color,
    radius: safeZone.radius,
    centerLongitude: safeZone.centerLongitude,
    centerLatitude: safeZone.centerLatitude,
    membersToTrack: safeZone.membersToTrack,
    isActive: safeZone.isActive,
    createdAt: safeZone.createdAt,
    familyId: familyId,
  };
};
