import { distanceMeters, isInsideZone, zonesContaining } from '../model/geo';

const eiffel = { latitude: 48.8584, longitude: 2.2945 };
const arc = { latitude: 48.8738, longitude: 2.295 };

const zone = (over: Partial<Parameters<typeof isInsideZone>[1]> = {}) => ({
  centerLatitude: eiffel.latitude,
  centerLongitude: eiffel.longitude,
  radius: 200,
  isActive: true,
  ...over,
});

describe('distanceMeters', () => {
  it('is zero for the same point and symmetric', () => {
    expect(distanceMeters(eiffel, eiffel)).toBe(0);
    expect(distanceMeters(eiffel, arc)).toBeCloseTo(distanceMeters(arc, eiffel), 6);
  });

  it('matches a known distance: Eiffel Tower to Arc de Triomphe is about 1.7 km', () => {
    expect(distanceMeters(eiffel, arc)).toBeGreaterThan(1650);
    expect(distanceMeters(eiffel, arc)).toBeLessThan(1750);
  });

  it('handles the antimeridian and the poles without NaN', () => {
    expect(distanceMeters({ latitude: 0, longitude: 179.9999 }, { latitude: 0, longitude: -179.9999 })).toBeLessThan(30);
    expect(Number.isNaN(distanceMeters({ latitude: 90, longitude: 0 }, { latitude: -90, longitude: 0 }))).toBe(false);
  });
});

describe('isInsideZone', () => {
  it('contains points within the radius and excludes points outside', () => {
    expect(isInsideZone({ latitude: 48.8590, longitude: 2.2945 }, zone())).toBe(true); // ~67 m north
    expect(isInsideZone(arc, zone())).toBe(false);
  });

  it('treats the exact boundary as inside', () => {
    const edge = { latitude: eiffel.latitude, longitude: eiffel.longitude + 0.001 };
    const radius = distanceMeters(eiffel, edge);
    expect(isInsideZone(edge, zone({ radius }))).toBe(true);
    expect(isInsideZone(edge, zone({ radius: radius - 0.5 }))).toBe(false);
  });

  it('inactive zones contain nothing', () => {
    expect(isInsideZone(eiffel, zone({ isActive: false }))).toBe(false);
  });

  it('zonesContaining returns every matching zone', () => {
    const zones = [{ id: 'a', ...zone() }, { id: 'b', ...zone({ radius: 5000 }) }, { id: 'c', ...zone({ centerLatitude: 0, centerLongitude: 0 }) }];
    expect(zonesContaining(eiffel, zones).map((z) => z.id)).toEqual(['a', 'b']);
  });
});
