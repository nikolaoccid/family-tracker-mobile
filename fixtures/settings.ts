
/** Wire shape of `GET /privacy-settings`. */
export const createPrivacyDto = () => ({
  locationSharingEnabled: true,
  visibleTo: 'all',
  selectedMembers: [] as string[],
  schedules: [
    { id: 'schedule-1', name: 'School days', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], startTime: '07:30', endTime: '15:30', enabled: true },
    { id: 'schedule-2', name: 'Weekend trips', days: ['saturday', 'sunday'], startTime: '09:00', endTime: '20:00', enabled: false },
  ],
  notificationsEnabled: true,
  notifyLowBattery: true,
  notifyZoneEntry: true,
  notifyZoneExit: false,
});
