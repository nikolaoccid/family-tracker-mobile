import { z } from 'zod';
import { openEnum } from '@/shared/api';

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const sharingScheduleSchema = z.object({
  id: z.string(),
  name: z.string().nullish().transform((v) => v ?? ''),
  days: z
    .array(z.string())
    .nullish()
    .transform((days) => (days ?? []).filter((d): d is Weekday => (WEEKDAYS as readonly string[]).includes(d))),
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean().nullish().transform((v) => v ?? true),
});
export type SharingSchedule = z.infer<typeof sharingScheduleSchema>;

export interface PrivacySettings {
  locationSharing: {
    enabled: boolean;
    visibleTo: 'all' | 'selected' | 'none';
    selectedMembers: string[];
    schedules: SharingSchedule[];
  };
  notificationSettings: {
    enabled: boolean;
    lowBattery: boolean;
    zoneEntry: boolean;
    zoneExit: boolean;
  };
}

export const defaultPrivacySettings: PrivacySettings = {
  locationSharing: { enabled: true, visibleTo: 'all', selectedMembers: [], schedules: [] },
  notificationSettings: { enabled: true, lowBattery: true, zoneEntry: true, zoneExit: true },
};

const flag = (fallback: boolean) => z.boolean().nullish().transform((v) => v ?? fallback);

/** Wire shape of `GET /privacy-settings`, mapped to the nested app model. */
export const privacySettingsSchema = z
  .object({
    locationSharingEnabled: flag(true),
    visibleTo: openEnum(['all', 'selected', 'none'] as const, 'all'),
    selectedMembers: z.array(z.string()).nullish().transform((v) => v ?? []),
    schedules: z.array(sharingScheduleSchema).nullish().transform((v) => v ?? []),
    notificationsEnabled: flag(true),
    notifyLowBattery: flag(true),
    notifyZoneEntry: flag(true),
    notifyZoneExit: flag(true),
  })
  .transform(
    (dto): PrivacySettings => ({
      locationSharing: {
        enabled: dto.locationSharingEnabled,
        visibleTo: dto.visibleTo,
        selectedMembers: dto.selectedMembers,
        schedules: dto.schedules,
      },
      notificationSettings: {
        enabled: dto.notificationsEnabled,
        lowBattery: dto.notifyLowBattery,
        zoneEntry: dto.notifyZoneEntry,
        zoneExit: dto.notifyZoneExit,
      },
    }),
  );

export function toPrivacyDto(settings: PrivacySettings) {
  return {
    locationSharingEnabled: settings.locationSharing.enabled,
    visibleTo: settings.locationSharing.visibleTo,
    selectedMembers: settings.locationSharing.selectedMembers,
    schedules: settings.locationSharing.schedules,
    notificationsEnabled: settings.notificationSettings.enabled,
    notifyLowBattery: settings.notificationSettings.lowBattery,
    notifyZoneEntry: settings.notificationSettings.zoneEntry,
    notifyZoneExit: settings.notificationSettings.zoneExit,
  };
}
