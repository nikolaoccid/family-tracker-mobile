import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { SwitchRow } from '@/shared/ui/SwitchRow';
import { setNotification } from '../model/privacyEdits';
import type { PrivacySettings } from '../model/privacy';
import { SectionHeader } from './SectionHeader';

const TOGGLES = [
  { key: 'lowBattery', label: 'Low Battery Alerts' },
  { key: 'zoneEntry', label: 'Zone Entry Alerts' },
  { key: 'zoneExit', label: 'Zone Exit Alerts' },
] as const;

export function NotificationsSection({
  settings,
  onChange,
}: {
  settings: PrivacySettings;
  onChange: (n: PrivacySettings) => void;
}) {
  const notifications = settings.notificationSettings;
  return (
    <View style={styles.section}>
      <SectionHeader Icon={Bell} title="Notifications" />
      <SwitchRow
        label="Enable Notifications"
        value={notifications.enabled}
        onValueChange={(v) => onChange(setNotification(settings, 'enabled', v))}
      />
      {notifications.enabled &&
        TOGGLES.map(({ key, label }) => (
          <SwitchRow
            key={key}
            label={label}
            value={notifications[key]}
            onValueChange={(v) => onChange(setNotification(settings, key, v))}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 24 },
});
