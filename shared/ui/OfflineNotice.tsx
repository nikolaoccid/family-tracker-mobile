import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Colors from './colors';

/** Banner shown while the device has no network connection. */
export default function OfflineNotice() {
  const { isConnected } = useNetInfo();
  if (isConnected !== false) return null;
  return (
    <View style={styles.container} accessibilityRole="alert">
      <WifiOff size={16} color="#fff" />
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: Colors.warning,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
