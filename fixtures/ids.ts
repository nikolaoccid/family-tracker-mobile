/** Fully fictional identities for demo mode, tests and screenshots. Emails use the reserved example.com domain. */
export const ids = {
  family: '11111111-1111-4111-8111-111111111111',
  ana: '22222222-0000-4000-8000-000000000001',
  marko: '22222222-0000-4000-8000-000000000002',
  iva: '22222222-0000-4000-8000-000000000003',
  tomas: '22222222-0000-4000-8000-000000000004',
  zoneHome: '33333333-0000-4000-8000-000000000001',
  zoneSchool: '33333333-0000-4000-8000-000000000002',
  zonePark: '33333333-0000-4000-8000-000000000003',
} as const;

/** Public landmarks in Paris, so no coordinate points at a private place. */
export const landmarks = {
  eiffelTower: { latitude: 48.8584, longitude: 2.2945 },
  louvre: { latitude: 48.8606, longitude: 2.3376 },
  notreDame: { latitude: 48.853, longitude: 2.3499 },
  arcDeTriomphe: { latitude: 48.8738, longitude: 2.295 },
  sacreCoeur: { latitude: 48.8867, longitude: 2.3431 },
} as const;
