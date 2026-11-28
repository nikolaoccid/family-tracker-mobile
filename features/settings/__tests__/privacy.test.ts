import { privacySettingsSchema, toPrivacyDto, defaultPrivacySettings } from '../model/privacy';
import {
  removeSchedule,
  setMemberVisible,
  setNotification,
  setScheduleEnabled,
  setSharingEnabled,
  setVisibility,
} from '../model/privacyEdits';
import { createPrivacyDto } from '@/fixtures';

describe('privacy settings wire mapping', () => {
  it('maps the backend dto to the nested model', () => {
    const parsed = privacySettingsSchema.parse(createPrivacyDto());
    expect(parsed.locationSharing.visibleTo).toBe('all');
    expect(parsed.locationSharing.schedules).toHaveLength(2);
    expect(parsed.notificationSettings).toEqual({ enabled: true, lowBattery: true, zoneEntry: true, zoneExit: false });
  });

  it('round-trips: model -> dto -> model', () => {
    const model = privacySettingsSchema.parse(createPrivacyDto());
    expect(privacySettingsSchema.parse(toPrivacyDto(model))).toEqual(model);
  });

  it('tolerates a sparse, null-laden and future-proofed response', () => {
    const parsed = privacySettingsSchema.parse({
      locationSharingEnabled: null,
      visibleTo: 'friends-of-friends', // an enum value from a newer server
      selectedMembers: null,
      schedules: [
        { id: 's', startTime: '01:00', endTime: '02:00', days: ['monday', 'someday'], name: null, enabled: null },
      ],
      brandNewField: { nested: true },
    });
    expect(parsed.locationSharing).toEqual({
      enabled: true,
      visibleTo: 'all',
      selectedMembers: [],
      schedules: [{ id: 's', name: '', days: ['monday'], startTime: '01:00', endTime: '02:00', enabled: true }],
    });
    expect(parsed.notificationSettings.enabled).toBe(true);
  });

  it('does not accept a response with no body at all', () => {
    expect(privacySettingsSchema.safeParse(null).success).toBe(false);
  });
});

describe('privacy edits', () => {
  const base = defaultPrivacySettings;
  it('never mutate the input', () => {
    const frozen = structuredClone(base);
    setSharingEnabled(base, false);
    setVisibility(base, 'none');
    setMemberVisible(base, 'm', true);
    setNotification(base, 'lowBattery', false);
    expect(base).toEqual(frozen);
  });

  it('edits the right field', () => {
    expect(setSharingEnabled(base, false).locationSharing.enabled).toBe(false);
    expect(setVisibility(base, 'selected').locationSharing.visibleTo).toBe('selected');
    expect(setNotification(base, 'zoneExit', false).notificationSettings.zoneExit).toBe(false);
  });

  it('adds and removes visible members without duplicates', () => {
    const once = setMemberVisible(base, 'm', true);
    expect(setMemberVisible(once, 'm', true).locationSharing.selectedMembers).toEqual(['m']);
    expect(setMemberVisible(once, 'm', false).locationSharing.selectedMembers).toEqual([]);
  });

  it('toggles and removes schedules by id', () => {
    const withSchedules = privacySettingsSchema.parse(createPrivacyDto());
    expect(setScheduleEnabled(withSchedules, 'schedule-2', true).locationSharing.schedules[1]?.enabled).toBe(true);
    expect(removeSchedule(withSchedules, 'schedule-1').locationSharing.schedules.map((s) => s.id)).toEqual([
      'schedule-2',
    ]);
  });
});
