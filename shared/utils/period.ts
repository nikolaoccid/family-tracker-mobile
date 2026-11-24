export type Period = 'day' | 'week' | 'month';

export const PERIODS: readonly { id: Period; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_DAYS: Record<Period, number> = { day: 0, week: 7, month: 30 };

const isoDay = (date: Date) => date.toISOString().split('T')[0] as string;

/** Inclusive date range ending today, as `YYYY-MM-DD` strings (what the API expects). */
export function rangeFor(period: Period, now: Date = new Date()): { startDate: string; endDate: string } {
  return { startDate: isoDay(new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS)), endDate: isoDay(now) };
}
