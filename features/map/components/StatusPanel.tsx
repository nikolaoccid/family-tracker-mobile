import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BatteryMedium, MapPin, Navigation } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';

interface Props {
  batteryPercent: number | null;
  sharingActive: boolean;
  /** Names of the zones the user is currently inside. */
  insideZones: readonly string[];
}

export function StatusPanel({ batteryPercent, sharingActive, insideZones }: Props) {
  return (
    <View style={styles.panel}>
      {batteryPercent !== null && (
        <View style={styles.row}>
          <BatteryMedium size={16} color={batteryPercent < 20 ? Colors.danger : Colors.light.subtext} />
          <Text style={styles.text}>{batteryPercent}%</Text>
        </View>
      )}
      <View style={styles.row}>
        <Navigation size={16} color={Colors.primary} />
        <Text style={styles.sharing}>
          {sharingActive ? 'Location sharing is active' : 'Waiting for location services...'}
        </Text>
      </View>
      {insideZones.length > 0 && (
        <View style={styles.row}>
          <MapPin size={16} color={Colors.success} />
          <Text style={styles.text}>In {insideZones.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 14, color: Colors.light.text, marginLeft: 8 },
  sharing: { fontSize: 14, color: Colors.primary, marginLeft: 8 },
});
