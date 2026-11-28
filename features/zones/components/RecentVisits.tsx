import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { formatDate } from '@/shared/utils/date';
import { formatDuration } from '../model/analytics';
import type { ZoneVisit } from '../model/zone';

const SHOWN = 5;
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function RecentVisits({ visits }: { visits: readonly ZoneVisit[] }) {
  if (visits.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recent Visits</Text>
      {visits.slice(0, SHOWN).map((visit) => (
        <View key={visit.entryTime} style={styles.item}>
          <View style={styles.when}>
            <Text style={styles.date}>{formatDate(new Date(visit.entryTime))}</Text>
            <Text style={styles.time}>
              {clock(visit.entryTime)}
              {visit.exitTime ? ` - ${clock(visit.exitTime)}` : ''}
            </Text>
          </View>
          <Text style={styles.duration}>{formatDuration(visit.duration)}</Text>
        </View>
      ))}
      {visits.length > SHOWN && <Text style={styles.more}>+ {visits.length - SHOWN} more visits</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 20, marginBottom: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  when: { flex: 1 },
  date: { fontSize: 14, fontWeight: '500', color: Colors.light.text, marginBottom: 4 },
  time: { fontSize: 12, color: Colors.light.subtext },
  duration: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  more: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center', marginTop: 12 },
});
