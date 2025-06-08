// src/utils/privacySettingsMapper.ts


import {PrivacySettings} from "@/types";

export function toBackendDto(settings: PrivacySettings) {
  return {
    locationSharingEnabled: settings.locationSharing.enabled,
    visibleTo: settings.locationSharing.visibleTo,
    selectedMembers: settings.locationSharing.selectedMembers,
    schedules: settings.locationSharing.schedules || [],
    notificationsEnabled: settings.notificationSettings.enabled,
    notifyLowBattery: settings.notificationSettings.lowBattery,
    notifyZoneEntry: settings.notificationSettings.zoneEntry,
    notifyZoneExit: settings.notificationSettings.zoneExit,
  };
}

export function fromBackendDto(dto: any): PrivacySettings {
  return {
    locationSharing: {
      enabled: dto.locationSharingEnabled,
      visibleTo: dto.visibleTo,
      selectedMembers: dto.selectedMembers || [],
      schedules: dto.schedules || [],
    },
    notificationSettings: {
      enabled: dto.notificationsEnabled,
      lowBattery: dto.notifyLowBattery,
      zoneEntry: dto.notifyZoneEntry,
      zoneExit: dto.notifyZoneExit,
    },
  };
}
