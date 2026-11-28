import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/shared/ui/theme';

export function EmptyMapState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>Family members' locations would be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mapBackground, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.light.subtext, textAlign: 'center', paddingHorizontal: 40, marginBottom: 16 },
});
