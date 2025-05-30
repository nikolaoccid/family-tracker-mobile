import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, {Circle, Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Colors from '@/constants/colors';
import {SafeZone} from "@/types";

function Map({ familyLocations = [], safeZones = [] }: {familyLocations: any[], safeZones?: any[]}) {
  console.log('safeZones', safeZones);
  const mapRef = useRef<MapView>(null);

  const defaultLat = 37.78825;
  const defaultLng = -122.4324;

  const initialLat = familyLocations[0]?.latitude ?? defaultLat;
  const initialLng = familyLocations[0]?.longitude ?? defaultLng;

  const [region, setRegion] = useState<Region>({
    latitude: typeof initialLat === 'number' ? initialLat : defaultLat,
    longitude: typeof initialLng === 'number' ? initialLng : defaultLng,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (familyLocations.length > 0) {
      const lat = familyLocations[0].latitude;
      const lng = familyLocations[0].longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const updatedRegion = {
          ...region,
          latitude: lat,
          longitude: lng,
        };
        setRegion(updatedRegion);
        mapRef.current?.animateToRegion(updatedRegion, 300);
      }
    }
  }, [familyLocations]);


  const zoom = (factor: number) => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * factor,
      longitudeDelta: region.longitudeDelta * factor,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 200);
  };

  return (
    <View style={styles.container}>
      {familyLocations.length > 0 ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {familyLocations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude || 0,
                  longitude: location.longitude || 0,
                }}
                title={location?.user?.name || 'Unknown'}
              />
            ))}

            {safeZones?.map((zone) => (
              <Circle
                key={zone.id}
                center={{
                  latitude: zone.centerLatitude,
                  longitude: zone.centerLongitude,
                }}
                radius={zone.radius}
                strokeColor={zone.color}
                fillColor={`${zone.color}33`} // 20% opacity
                zIndex={1}
              />
            ))}

          </MapView>


          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(0.5)}>
              <Text style={styles.zoomText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(2)}>
              <Text style={styles.zoomText}>−</Text>
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
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
