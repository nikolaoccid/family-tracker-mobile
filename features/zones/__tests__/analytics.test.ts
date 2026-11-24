import { dayBarPercent, formatDuration, sharePercent, totalMinutes } from '../model/analytics';
import { rangeFor } from '@/shared/utils/period';

describe('formatDuration', () => {
  it.each([
    [0, '0 min'],
    [45, '45 min'],
    [60, '1 hr'],
    [125, '2 hr 5 min'],
    [59.6, '1 hr'],
  ])('%s minutes reads %s', (minutes, text) => expect(formatDuration(minutes)).toBe(text));
});

describe('analytics maths', () => {
  it('sums time across zones', () => {
    expect(totalMinutes([{ totalTimeSpent: 10 }, { totalTimeSpent: 32 }] as never)).toBe(42);
    expect(totalMinutes([])).toBe(0);
  });

  it('shares never divide by zero', () => {
    expect(sharePercent(25, 100)).toBe(25);
    expect(sharePercent(1, 3)).toBe(33);
    expect(sharePercent(5, 0)).toBe(0);
  });

  it('bars fill at eight hours and stay within bounds', () => {
    expect(dayBarPercent(240)).toBe(50);
    expect(dayBarPercent(9999)).toBe(100);
    expect(dayBarPercent(-5)).toBe(0);
  });
});

describe('rangeFor', () => {
  const now = new Date('2026-03-15T12:00:00.000Z');
  it('ends today and starts the right number of days back', () => {
    expect(rangeFor('day', now)).toEqual({ startDate: '2026-03-15', endDate: '2026-03-15' });
    expect(rangeFor('week', now)).toEqual({ startDate: '2026-03-08', endDate: '2026-03-15' });
    expect(rangeFor('month', now)).toEqual({ startDate: '2026-02-13', endDate: '2026-03-15' });
  });
});
