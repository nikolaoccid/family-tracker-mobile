import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Colors from '@/constants/colors';
import { Plus, Minus } from 'lucide-react-native';

function Map({ familyLocations = [], safeZones = [] }: { familyLocations: any[]; safeZones?: any[] }) {
  const mapRef = useRef<MapView>(null);
  const [famLocations, setFamLocations] = useState(familyLocations);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Delay mount by one tick to ensure stability
    const timeout = setTimeout(() => setMapReady(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const data = familyLocations.map((location) => ({
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
      user: {
        name: location.user?.name || 'Unknown',
        id: location.user?.id || 'unknown',
      },
    }));
    setFamLocations(familyLocations);
  }, [familyLocations]);

  const defaultLat = 37.78825;
  const defaultLng = -122.4324;

  const [zoomRegion, setZoomRegion] = useState<Region>({
    latitude: familyLocations[0]?.latitude ?? defaultLat,
    longitude: familyLocations[0]?.longitude ?? defaultLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (familyLocations.length > 0) {
      const lat = familyLocations[0].latitude;
      const lng = familyLocations[0].longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const updatedRegion = {
          ...zoomRegion,
          latitude: lat,
          longitude: lng,
        };
        setZoomRegion(updatedRegion);
        mapRef.current?.animateToRegion(updatedRegion, 300);
      }
    }
  }, [familyLocations]);

  const zoom = (factor: number) => {
    const newRegion = {
      ...zoomRegion,
      latitudeDelta: Math.max(0.001, zoomRegion.latitudeDelta * factor),
      longitudeDelta: Math.max(0.001, zoomRegion.longitudeDelta * factor),
    };
    setZoomRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 200);
  };

  return (
    <View style={styles.container}>
      {mapReady && famLocations.length > 0 ? (
        <>
          <MapView
            onMapReady={() => setMapReady(true)}
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={zoomRegion}
          >
            {famLocations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude || 0,
                  longitude: location.longitude || 0,
                }}
                title={location?.user?.name || 'Unknown'}
              />
            ))}

            {safeZones?.filter((zone)=> zone.isActive).map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={{
                    latitude: zone.centerLatitude,
                    longitude: zone.centerLongitude,
                  }}
                  radius={zone.radius}
                  strokeColor={zone.color}
                  fillColor={`${zone.color}33`}
                  zIndex={1}
                />
                <Marker
                  coordinate={{
                    latitude: zone.centerLatitude,
                    longitude: zone.centerLongitude,
                  }}
                  anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={false}
                >
                  <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 'normal',
                      fontSize: 12,
                    }}>
                      {zone.name}
                    </Text>
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(0.5)}>
              <Plus size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(2)}>
              <Minus size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.mockMapText}>Map View</Text>
          <Text style={styles.mockMapSubtext}>
            Family members' locations would be displayed here
          </Text>
        </View>
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
  emptyState: {
    flex: 1,
    backgroundColor: '#E8EEF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockMapText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  mockMapSubtext: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
});

export default Map;
