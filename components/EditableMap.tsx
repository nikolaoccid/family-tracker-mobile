import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Colors from '@/constants/colors';
import { Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react-native';

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
  const mapRef = useRef<MapView>(null);

  const [zoomRegion, setZoomRegion] = useState<Region>({
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    setZoomRegion((prev) => ({
      ...prev,
      latitude: center.latitude,
      longitude: center.longitude,
    }));
  }, [center]);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={zoomRegion}
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

      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => zoom(0.5)}
        >
          <ZoomIn size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => zoom(2)}
        >
          <ZoomOut size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.radiusControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setRadius(Math.max(50, radius - 50))}
        >
          <Minus size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setRadius(Math.min(5000, radius + 50))}
        >
          <Plus size={18} color="#fff" />
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
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'column',
    gap: 8,
  },
  radiusControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
