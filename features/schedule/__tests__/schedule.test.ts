import {
  draftFromSchedule, emptyDraft, formatTimeInput, isSharingNow, isWithinSchedule, parseClock, toggleDay, validateDraft,
} from '../model/schedule';

const schedule = {
  id: 's1', name: 'School', days: ['monday', 'tuesday'] as ('monday' | 'tuesday')[], startTime: '08:00', endTime: '15:30', enabled: true,
};
// 2026-03-02 is a Monday, 2026-03-03 a Tuesday, 2026-03-04 a Wednesday (local time).
const at = (day: number, h: number, m = 0) => new Date(2026, 2, day, h, m);

describe('parseClock', () => {
  it.each([['08:00', 480], ['0:05', 5], ['23:59', 1439], ['24:00', null], ['12:60', null], ['9', null], ['ab:cd', null]])(
    '%s -> %s',
    (input, expected) => expect(parseClock(input)).toBe(expected),
  );
});

describe('isWithinSchedule', () => {
  it('is true on a scheduled day, from the start minute up to but not including the end minute', () => {
    expect(isWithinSchedule(schedule, at(2, 8, 0))).toBe(true);
    expect(isWithinSchedule(schedule, at(2, 15, 29))).toBe(true);
    expect(isWithinSchedule(schedule, at(2, 15, 30))).toBe(false);
    expect(isWithinSchedule(schedule, at(2, 7, 59))).toBe(false);
  });

  it('is false on other days and when disabled', () => {
    expect(isWithinSchedule(schedule, at(4, 10))).toBe(false);
    expect(isWithinSchedule({ ...schedule, enabled: false }, at(2, 10))).toBe(false);
  });

  it('is false for a corrupt time instead of throwing', () => {
    expect(isWithinSchedule({ ...schedule, startTime: 'soon' }, at(2, 10))).toBe(false);
  });
});

describe('isSharingNow', () => {
  it('shares always when there are no enabled schedules', () => {
    expect(isSharingNow([], at(4, 3))).toBe(true);
    expect(isSharingNow([{ ...schedule, enabled: false }], at(4, 3))).toBe(true);
  });

  it('shares only inside an enabled window otherwise', () => {
    expect(isSharingNow([schedule], at(2, 10))).toBe(true);
    expect(isSharingNow([schedule], at(2, 20))).toBe(false);
  });
});

describe('validateDraft', () => {
  it('accepts the default times once a name and a day are set', () => {
    expect(validateDraft({ ...emptyDraft(), name: 'Work', days: ['monday'] })).toEqual({});
  });

  it('reports a missing name, no days and a backwards time range', () => {
    expect(validateDraft(emptyDraft())).toEqual({ name: 'Schedule name is required', days: 'Select at least one day' });
    expect(validateDraft({ ...emptyDraft(), name: 'a', days: ['monday'], startTime: '17:00', endTime: '08:00' }).time).toBe(
      'End time must be after start time',
    );
    expect(validateDraft({ ...emptyDraft(), name: 'a', days: ['monday'], startTime: '08:00', endTime: '08:00' }).time).toBeDefined();
    expect(validateDraft({ ...emptyDraft(), name: 'a', days: ['monday'], startTime: '25:00' }).time).toBe('Invalid time values');
  });
});

describe('formatTimeInput', () => {
  it.each([['0', '0'], ['083', '08:3'], ['0830', '08:30'], ['830', '23:0'], ['2575', '23:59'], ['12ab34', '12:34'], ['123456', '12:34']])(
    '%s -> %s',
    (input, expected) => expect(formatTimeInput(input)).toBe(expected),
  );
});

describe('schedule helpers', () => {
  it('toggles days immutably and builds a draft from a schedule', () => {
    const days = ['monday'] as const;
    expect(toggleDay(days, 'tuesday')).toEqual(['monday', 'tuesday']);
    expect(toggleDay(days, 'monday')).toEqual([]);
    expect(draftFromSchedule(schedule)).toEqual({ name: 'School', days: ['monday', 'tuesday'], startTime: '08:00', endTime: '15:30', enabled: true });
  });
});
