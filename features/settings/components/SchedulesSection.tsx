import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';
import { removeSchedule, setScheduleEnabled } from '../model/privacyEdits';
import type { PrivacySettings, SharingSchedule } from '../model/privacy';
import { SectionHeader } from './SectionHeader';

const shortDays = (schedule: SharingSchedule) =>
  schedule.days.map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ');

export function SchedulesSection({ settings, onChange }: { settings: PrivacySettings; onChange: (n: PrivacySettings) => void }) {
  const router = useRouter();
  const schedules = settings.locationSharing.schedules;
  return (
    <View style={styles.section}>
      <SectionHeader Icon={Clock} title="Sharing Schedules" />
      <Text style={styles.description}>Set up specific times when your location is shared automatically.</Text>

      {schedules.length === 0 ? (
        <Text style={styles.empty}>No schedules set up yet</Text>
      ) : (
        schedules.map((schedule) => (
          <View key={schedule.id} style={styles.item}>
            <View style={styles.info}>
              <Text style={styles.name}>{schedule.name}</Text>
              <Text style={styles.time}>
                {schedule.startTime} - {schedule.endTime}
              </Text>
              <Text style={styles.days}>{shortDays(schedule)}</Text>
            </View>
            <Switch
              value={schedule.enabled}
              onValueChange={(v) => onChange(setScheduleEnabled(settings, schedule.id, v))}
              accessibilityLabel={`${schedule.name} enabled`}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={schedule.enabled ? Colors.primary : Colors.light.icon}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/schedule/edit?id=${schedule.id}`)} accessibilityLabel="Edit schedule">
              <ChevronRight size={20} color={Colors.light.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onChange(removeSchedule(settings, schedule.id))} accessibilityLabel="Delete schedule">
              <Trash2 size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <Button title="Add Schedule" onPress={() => router.push('/schedule/create')} icon={<Plus size={18} color={Colors.white} />} fullWidth style={styles.add} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 24 },
  description: { fontSize: 14, color: Colors.light.subtext, marginBottom: 16 },
  empty: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center', paddingVertical: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: Colors.light.text },
  time: { fontSize: 14, color: Colors.light.subtext, marginTop: 2 },
  days: { fontSize: 12, color: Colors.light.subtext, marginTop: 2 },
  iconButton: { padding: 8 },
  add: { marginTop: 16 },
});
