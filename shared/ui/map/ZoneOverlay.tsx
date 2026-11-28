import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Marker } from 'react-native-maps';
import type { MapZone } from './types';

const FILL_ALPHA = '33';

/** A safe zone drawn as a filled circle with its name pinned above the center. */
export function ZoneOverlay({ zone }: { zone: MapZone }) {
  const center = { latitude: zone.centerLatitude, longitude: zone.centerLongitude };
  return (
    <>
      <Circle
        center={center}
        radius={zone.radius}
        strokeColor={zone.color}
        fillColor={`${zone.color}${FILL_ALPHA}`}
        zIndex={1}
      />
      <Marker coordinate={center} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
        <View style={styles.label}>
          <Text style={styles.labelText}>{zone.name}</Text>
        </View>
      </Marker>
    </>
  );
}

const styles = StyleSheet.create({
  label: { backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  labelText: { color: 'rgba(255, 255, 255, 0.85)', fontWeight: 'normal', fontSize: 12 },
});
