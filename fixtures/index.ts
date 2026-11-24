import { createAlerts } from './alerts';
import { createChatMessages } from './chat';
import { createFamily, createFamilyLocations } from './family';
import { createHistory } from './locations';
import { createPrivacyDto } from './settings';
import { createAnalytics, createZones } from './zones';

export { ids, landmarks } from './ids';
export { users, demoUser, DEMO_TOKEN } from './users';
export { plans, paymentIntent } from './subscription';
export { chatToken } from './chat';
export { createAlerts, createChatMessages, createFamily, createFamilyLocations, createHistory, createPrivacyDto, createZones, createAnalytics };

/** Every fixture, built relative to `now` so recency-based UI (online dots, "5 min ago") is realistic. */
export function createFixtures(now: Date = new Date()) {
  return {
    family: createFamily(now),
    familyLocations: createFamilyLocations(),
    zones: createZones(),
    alerts: createAlerts(now),
    history: createHistory(now),
    privacy: createPrivacyDto(),
    chatMessages: createChatMessages(now),
    analytics: (zoneId: string, userId?: string) => createAnalytics(now, zoneId, userId),
  };
}
