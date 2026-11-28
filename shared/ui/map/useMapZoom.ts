import { RefObject, useState } from 'react';
import MapView, { Region } from 'react-native-maps';

const MIN_DELTA = 0.001;
const ZOOM_ANIMATION_MS = 200;

type Center = { latitude: number; longitude: number };

/** Square-region zoom state shared by the read-only and editable maps. */
export function useMapZoom(mapRef: RefObject<MapView | null>, center: Center, initialDelta: number) {
  const [delta, setDelta] = useState(initialDelta);
  const region: Region = { ...center, latitudeDelta: delta, longitudeDelta: delta };

  const zoom = (factor: number) => {
    const next = Math.max(MIN_DELTA, delta * factor);
    setDelta(next);
    mapRef.current?.animateToRegion({ ...center, latitudeDelta: next, longitudeDelta: next }, ZOOM_ANIMATION_MS);
  };

  return { region, zoom };
}
