import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { formatDuration, sharePercent, totalMinutes } from '../model/analytics';
import type { SafeZone, ZoneAnalytics } from '../model/zone';

interface Props {
  analytics: readonly ZoneAnalytics[];
  zones: readonly SafeZone[];
  onSelectZone: (zone: SafeZone) => void;
}

export function ZoneBreakdown({ analytics, zones, onSelectZone }: Props) {
  const total = totalMinutes(analytics);
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Zone Breakdown</Text>
      {analytics.map((entry) => {
        const zone = zones.find((z) => z.id === entry.zoneId);
        return (
          <TouchableOpacity key={entry.zoneId} style={styles.item} onPress={() => zone && onSelectZone(zone)}>
            <View style={[styles.dot, { backgroundColor: zone?.color ?? Colors.primary }]} />
            <View style={styles.info}>
              <Text style={styles.name}>{entry.zoneName}</Text>
              <Text style={styles.time}>{formatDuration(entry.totalTimeSpent)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{sharePercent(entry.totalTimeSpent, total)}%</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 20, marginBottom: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: Colors.light.text, marginBottom: 4 },
  time: { fontSize: 14, color: Colors.light.subtext },
  badge: { backgroundColor: `${Colors.primary}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
