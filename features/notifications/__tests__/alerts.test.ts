import { alertSchema } from '../model/alert';
import { selectAlerts } from '../model/selectAlerts';
import { useReadAlertsStore } from '../model/readAlertsStore';
import { persistOptions } from '@/shared/storage';
import { createAlerts } from '@/fixtures';

const NOW = new Date('2026-06-01T12:00:00.000Z');

describe('alert wire mapping', () => {
  it('maps flat coordinates to a location and keeps known types', () => {
    const alert = alertSchema.parse(createAlerts(NOW)[1]);
    expect(alert.type).toBe('zone_entry');
    expect(alert.location).toMatchObject({ latitude: 48.853, longitude: 2.3499 });
    expect(alert.read).toBe(false);
  });

  it('leaves location undefined when the alert has no coordinates (battery alerts)', () => {
    expect(alertSchema.parse(createAlerts(NOW)[0]).location).toBeUndefined();
  });

  it('maps an alert type added by a newer server to "unknown" instead of failing', () => {
    expect(alertSchema.parse({ id: 'x', type: 'geofence_breach_v2', timestamp: NOW.toISOString() }).type).toBe(
      'unknown',
    );
  });

  it('tolerates null fields and unknown extra fields', () => {
    const alert = alertSchema.parse({
      id: 'x',
      type: 'emergency',
      message: null,
      latitude: null,
      longitude: null,
      extra: 1,
      read: null,
    });
    expect(alert).toMatchObject({ message: '', location: undefined, read: false });
  });

  it('requires an id', () => {
    expect(alertSchema.safeParse({ type: 'emergency' }).success).toBe(false);
  });
});

describe('selectAlerts', () => {
  const alerts = createAlerts(NOW).map((a) => alertSchema.parse(a));

  it('sorts newest first', () => {
    const sorted = selectAlerts(alerts, new Set(), NOW);
    expect(sorted.map((a) => a.id)).toEqual(['alert-1', 'alert-2', 'alert-3', 'alert-4']);
  });

  it('marks alerts older than 24 hours, and opened alerts, as read', () => {
    const sorted = selectAlerts(alerts, new Set(['alert-2']), NOW);
    expect(Object.fromEntries(sorted.map((a) => [a.id, a.read]))).toEqual({
      'alert-1': false,
      'alert-2': true, // opened
      'alert-3': false, // 5 hours old
      'alert-4': true, // 30 hours old
    });
  });
});

describe('read alerts store', () => {
  beforeEach(() => useReadAlertsStore.setState({ readIds: [] }));

  it('remembers opened alerts once and stays bounded', () => {
    const { markRead } = useReadAlertsStore.getState();
    markRead('a');
    markRead('a');
    expect(useReadAlertsStore.getState().readIds).toEqual(['a']);
    for (let i = 0; i < 600; i++) markRead(`id-${i}`);
    expect(useReadAlertsStore.getState().readIds).toHaveLength(500);
    expect(useReadAlertsStore.getState().readIds.at(-1)).toBe('id-599');
  });

  it('migrates the v0 shape that lived inside the family store', async () => {
    const options = (
      useReadAlertsStore.persist as unknown as { getOptions: () => ReturnType<typeof persistOptions> }
    ).getOptions();
    const migrate = options.migrate as (s: unknown, v: number) => unknown;
    expect(migrate({ family: null, readAlertIds: ['a', 'b', 7] }, 0)).toEqual({ readIds: ['a', 'b'] });
    expect(migrate({ readAlertIds: 'garbage' }, 0)).toEqual({ readIds: [] });
    expect(migrate(null, 0)).toEqual({ readIds: [] });
  });
});
