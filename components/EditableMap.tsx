import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Colors from '@/constants/colors';

export default function EditableMap({
                                      center,
                                      setCenter,
                                      radius,
                                      setRadius,
                                      color,
                                    }: {
  center: { latitude: number; longitude: number };
  setCenter: (c: { latitude: number; longitude: number }) => void;
  radius: number;
  setRadius: (r: number) => void;
  color: string;
}) {
  const region: Region = {
    ...center,
    latitudeDelta: 0.045,
    longitudeDelta: 0.045,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onPress={(e) => setCenter(e.nativeEvent.coordinate)}
      >
        <Marker
          coordinate={center}
          draggable
          onDragEnd={(e) => setCenter(e.nativeEvent.coordinate)}
        />
        <Circle
          center={center}
          radius={radius}
          strokeColor={color}
          fillColor={`${color}33`}
        />
      </MapView>

      <View style={styles.radiusControls}>
        <TouchableOpacity
          style={styles.radiusButton}
          onPress={() => setRadius(Math.max(50, radius - 50))}
        >
          <Text style={styles.radiusText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radiusButton}
          onPress={() => setRadius(Math.min(5000, radius + 50))}
        >
          <Text style={styles.radiusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  radiusControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'column',
    gap: 8,
  },
  radiusButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  radiusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
