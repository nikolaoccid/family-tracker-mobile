import { http } from '@/shared/api';
import { privacySettingsSchema, toPrivacyDto, type PrivacySettings } from '../model/privacy';

export const privacyApi = {
  get: (signal?: AbortSignal) => http.get('/privacy-settings', { schema: privacySettingsSchema, signal }),
  update: (settings: PrivacySettings) => http.put('/privacy-settings', toPrivacyDto(settings)),
};
