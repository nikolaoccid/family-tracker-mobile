import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Colors from '@/shared/ui/colors';
import { Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react-native';

const MIN_RADIUS_M = 50;
const MAX_RADIUS_M = 5000;
const MIN_DELTA = 0.001;

interface Props {
  center: { latitude: number; longitude: number };
  setCenter: (c: { latitude: number; longitude: number }) => void;
  radius: number;
  setRadius: (r: number) => void;
  color: string;
}

export default function EditableMap({ center, setCenter, radius, setRadius, color }: Props) {
  const mapRef = useRef<MapView>(null);
  const [delta, setDelta] = useState(0.01);
  const region: Region = { ...center, latitudeDelta: delta, longitudeDelta: delta };

  const zoom = (factor: number) => {
    const next = Math.max(MIN_DELTA, delta * factor);
    setDelta(next);
    mapRef.current?.animateToRegion({ ...center, latitudeDelta: next, longitudeDelta: next }, 200);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
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
          onPress={() => setRadius(Math.min(MAX_RADIUS_M, radius + 50))}
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setRadius(Math.max(MIN_RADIUS_M, radius - 50))}
        >
          <Minus size={18} color="#fff" />
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
