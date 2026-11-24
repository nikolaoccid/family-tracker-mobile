import type { PrivacySettings } from './privacy';

type Visibility = PrivacySettings['locationSharing']['visibleTo'];
type NotificationKey = keyof PrivacySettings['notificationSettings'];

/** Immutable edits to a privacy draft; the screen holds the draft until the user saves. */
export const setSharingEnabled = (s: PrivacySettings, enabled: boolean): PrivacySettings => ({
  ...s,
  locationSharing: { ...s.locationSharing, enabled },
});

export const setVisibility = (s: PrivacySettings, visibleTo: Visibility): PrivacySettings => ({
  ...s,
  locationSharing: { ...s.locationSharing, visibleTo },
});

export const setMemberVisible = (s: PrivacySettings, memberId: string, visible: boolean): PrivacySettings => {
  const others = s.locationSharing.selectedMembers.filter((id) => id !== memberId);
  return {
    ...s,
    locationSharing: { ...s.locationSharing, selectedMembers: visible ? [...others, memberId] : others },
  };
};

export const setNotification = (s: PrivacySettings, key: NotificationKey, value: boolean): PrivacySettings => ({
  ...s,
  notificationSettings: { ...s.notificationSettings, [key]: value },
});

export const setScheduleEnabled = (s: PrivacySettings, scheduleId: string, enabled: boolean): PrivacySettings => ({
  ...s,
  locationSharing: {
    ...s.locationSharing,
    schedules: s.locationSharing.schedules.map((sch) => (sch.id === scheduleId ? { ...sch, enabled } : sch)),
  },
});

export const removeSchedule = (s: PrivacySettings, scheduleId: string): PrivacySettings => ({
  ...s,
  locationSharing: {
    ...s.locationSharing,
    schedules: s.locationSharing.schedules.filter((sch) => sch.id !== scheduleId),
  },
});
