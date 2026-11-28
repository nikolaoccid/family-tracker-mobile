import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { formatDate } from '@/shared/utils/date';
import { dayBarPercent, formatDuration } from '../model/analytics';
import type { ZoneAnalytics } from '../model/zone';

export function DailyBreakdown({ days, color }: { days: ZoneAnalytics['timeByDay']; color: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Daily Breakdown</Text>
      {days.map((day) => (
        <View key={day.date} style={styles.item}>
          <Text style={styles.date}>{formatDate(new Date(day.date))}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.bar, { width: `${dayBarPercent(day.minutes)}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.time}>{formatDuration(day.minutes)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 20, marginBottom: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 16 },
  item: { marginBottom: 16 },
  date: { fontSize: 14, fontWeight: '500', color: Colors.light.text, marginBottom: 8 },
  barTrack: { height: 12, backgroundColor: `${Colors.primary}20`, borderRadius: 6, marginBottom: 4 },
  bar: { height: 12, borderRadius: 6 },
  time: { fontSize: 12, color: Colors.light.subtext, alignSelf: 'flex-end' },
});
