import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import type { LocationHistory } from '@/features/location';
import Colors from '@/shared/ui/colors';
import { formatDate } from '@/shared/utils/date';

const SHOWN = 10;

export function RecentLocations({ points }: { points: readonly LocationHistory[] }) {
  if (points.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recent Locations</Text>
      {points.slice(0, SHOWN).map((point) => (
        <View key={point.id} style={styles.item}>
          <View style={styles.icon}>
            <MapPin size={20} color={Colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.coords}>
              {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
            </Text>
            <View style={styles.time}>
              <Clock size={14} color={Colors.light.subtext} />
              <Text style={styles.timeText}>{formatDate(new Date(point.timestamp))}</Text>
            </View>
          </View>
        </View>
      ))}
      {points.length > SHOWN && <Text style={styles.more}>+ {points.length - SHOWN} more locations</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.primary}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  coords: { fontSize: 14, fontWeight: '500', color: Colors.light.text, marginBottom: 4 },
  time: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: Colors.light.subtext, marginLeft: 4 },
  more: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center', marginTop: 12 },
});
