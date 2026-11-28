import { formFromZone, toggleMember, toNewZone, validateZoneForm } from '../model/zoneForm';

describe('validateZoneForm', () => {
  it('accepts a named zone with a radius in range', () => {
    expect(validateZoneForm({ name: 'Home', radius: '200' })).toEqual({});
    expect(validateZoneForm({ name: 'Home', radius: '50' })).toEqual({});
    expect(validateZoneForm({ name: 'Home', radius: '5000' })).toEqual({});
  });

  it('reports each problem on its own field', () => {
    expect(validateZoneForm({ name: '  ', radius: '200' })).toEqual({ name: 'Zone name is required' });
    expect(validateZoneForm({ name: 'A', radius: '49' }).radius).toMatch(/between 50 and 5000/);
    expect(validateZoneForm({ name: 'A', radius: '5001' }).radius).toBeDefined();
    expect(validateZoneForm({ name: 'A', radius: 'abc' }).radius).toBeDefined();
    expect(Object.keys(validateZoneForm({ name: '', radius: '' }))).toEqual(['name', 'radius']);
  });
});

describe('zone form mapping', () => {
  const zone = {
    id: 'z1',
    name: 'Home',
    color: '#fff',
    radius: 150,
    centerLatitude: 1,
    centerLongitude: 2,
    membersToTrack: ['a'],
    isActive: false,
    createdAt: '',
  };

  it('round-trips a zone through the form', () => {
    const values = formFromZone(zone);
    expect(values.radius).toBe('150');
    expect(toNewZone(values)).toEqual({
      name: 'Home',
      color: '#fff',
      radius: 150,
      centerLatitude: 1,
      centerLongitude: 2,
      membersToTrack: ['a'],
      isActive: false,
    });
  });

  it('trims the name and toggles members without mutating', () => {
    expect(toNewZone({ ...formFromZone(zone), name: '  Park ' }).name).toBe('Park');
    const members = ['a', 'b'];
    expect(toggleMember(members, 'a')).toEqual(['b']);
    expect(toggleMember(members, 'c')).toEqual(['a', 'b', 'c']);
    expect(members).toEqual(['a', 'b']);
  });
});
