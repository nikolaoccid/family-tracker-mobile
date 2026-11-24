import { usePrivacySettings, useUpdatePrivacySettings, type SharingSchedule } from '@/features/settings';
import { newScheduleId, type ScheduleDraft } from '../model/schedule';

/** Schedules live inside the privacy settings document, so each change is a settings update. */
export function useSchedules() {
  const settings = usePrivacySettings();
  const update = useUpdatePrivacySettings();

  const write = (schedules: SharingSchedule[]) => {
    if (!settings.data) return Promise.reject(new Error('Privacy settings not loaded'));
    const next = { ...settings.data, locationSharing: { ...settings.data.locationSharing, schedules } };
    return update.mutateAsync(next);
  };
  const current = settings.data?.locationSharing.schedules ?? [];

  return {
    query: settings,
    schedules: current,
    isSaving: update.isPending,
    error: update.error,
    create: (draft: ScheduleDraft) => write([...current, { ...draft, id: newScheduleId() }]),
    save: (id: string, draft: ScheduleDraft) => write(current.map((s) => (s.id === id ? { ...s, ...draft } : s))),
    remove: (id: string) => write(current.filter((s) => s.id !== id)),
  };
}
