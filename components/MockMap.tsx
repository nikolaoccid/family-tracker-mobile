import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Colors from '@/constants/colors';

function MockMap({ familyLocations = [] }) {
  console.log('MockMap rendered with familyLocations:', JSON.stringify(familyLocations, null, 2));
  const initialRegion = {
    latitude: familyLocations[0]?.latitude || 37.78825,
    longitude: familyLocations[0]?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      {familyLocations.length > 0 ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
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
        </MapView>
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

export default MockMap;
