import React, { useCallback, useRef, useState } from 'react';
import { useMapZoom } from './useMapZoom';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '@/shared/ui/theme';
import { Plus, Minus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ZoneOverlay } from './ZoneOverlay';
import { EmptyMapState } from './EmptyMapState';
import type { MapMember, MapZone } from './types';

interface Props {
  familyLocations?: readonly MapMember[];
  safeZones?: readonly MapZone[];
}

const DEFAULT_CENTER = { latitude: 48.8584, longitude: 2.2945 }; // Eiffel Tower: neutral until positions arrive

export function Map({ familyLocations = [], safeZones = [] }: Props) {
  const mapRef = useRef<MapView>(null);
  const [mapKey, setMapKey] = useState(0);

  // Remount the native map when the tab regains focus; Android can lose its tiles otherwise.
  useFocusEffect(
    useCallback(() => {
      setMapKey((prev) => prev + 1);
    }, []),
  );

  const first = familyLocations.find((m) => typeof m.latitude === 'number' && typeof m.longitude === 'number');
  const center = first ? { latitude: first.latitude as number, longitude: first.longitude as number } : DEFAULT_CENTER;
  const { region, zoom } = useMapZoom(mapRef, center, 0.05);

  return (
    <View style={styles.container}>
      {familyLocations.length > 0 ? (
        <>
          <MapView key={mapKey} ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE} region={region}>
            {familyLocations.map((location, index) => (
              <Marker
                key={index + location.id}
                coordinate={{
                  latitude: location.latitude || 0,
                  longitude: location.longitude || 0,
                }}
                title={location.user?.name || 'Unknown'}
              />
            ))}

            {safeZones
              .filter((zone) => zone.isActive)
              .map((zone) => (
                <ZoneOverlay key={zone.id} zone={zone} />
              ))}
          </MapView>

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(0.5)}>
              <Plus size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(2)}>
              <Minus size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <EmptyMapState />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: '13%',
    flexDirection: 'column',
    gap: 10,
  },
  zoomButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
