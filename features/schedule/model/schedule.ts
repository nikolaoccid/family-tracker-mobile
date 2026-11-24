import { WEEKDAYS, type SharingSchedule, type Weekday } from '@/features/settings';

export { WEEKDAYS, type Weekday };

export interface ScheduleDraft {
  name: string;
  days: Weekday[];
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export type ScheduleErrors = Partial<Record<'name' | 'days' | 'time', string>>;

export const emptyDraft = (): ScheduleDraft => ({
  name: '',
  days: [],
  startTime: '08:00',
  endTime: '17:00',
  enabled: true,
});

export const draftFromSchedule = ({ name, days, startTime, endTime, enabled }: SharingSchedule): ScheduleDraft => ({
  name,
  days,
  startTime,
  endTime,
  enabled,
});

/** "08:30" to minutes since midnight, or null when it is not a valid 24-hour time. */
export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export function validateDraft(draft: ScheduleDraft): ScheduleErrors {
  const errors: ScheduleErrors = {};
  if (!draft.name.trim()) errors.name = 'Schedule name is required';
  if (draft.days.length === 0) errors.days = 'Select at least one day';

  const start = parseClock(draft.startTime);
  const end = parseClock(draft.endTime);
  if (start === null || end === null) errors.time = 'Invalid time values';
  else if (start >= end) errors.time = 'End time must be after start time';
  return errors;
}

/** Keeps typed digits as `HH:MM`, clamping hours to 23 and minutes to 59. */
export function formatTimeInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  const hours = Math.min(23, Number(digits.slice(0, 2)));
  const minutes = Math.min(59, Number(digits.slice(2)));
  const pad = (n: number, width: number) => String(n).padStart(width, '0');
  return `${pad(hours, 2)}:${digits.length === 3 ? digits.slice(2) : pad(minutes, 2)}`;
}

export const toggleDay = (days: readonly Weekday[], day: Weekday): Weekday[] =>
  days.includes(day) ? days.filter((d) => d !== day) : [...days, day];

const JS_DAY_TO_WEEKDAY: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * True when `now` falls inside an enabled schedule: one of its days, from the
 * start minute up to (not including) the end minute.
 */
export function isWithinSchedule(schedule: SharingSchedule, now: Date): boolean {
  if (!schedule.enabled) return false;
  const day = JS_DAY_TO_WEEKDAY[now.getDay()] as Weekday;
  if (!schedule.days.includes(day)) return false;
  const start = parseClock(schedule.startTime);
  const end = parseClock(schedule.endTime);
  if (start === null || end === null) return false;
  const minute = now.getHours() * 60 + now.getMinutes();
  return minute >= start && minute < end;
}

/** True when any enabled schedule is active, or when there are no schedules at all. */
export function isSharingNow(schedules: readonly SharingSchedule[], now: Date): boolean {
  const enabled = schedules.filter((s) => s.enabled);
  return enabled.length === 0 || enabled.some((s) => isWithinSchedule(s, now));
}

export const newScheduleId = (now: Date = new Date()): string => `schedule-${now.getTime()}`;
