import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, Home } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';

interface Props {
  onEmergency: () => void;
  onHeadingHome: () => void;
}

export function SafetyActions({ onEmergency, onHeadingHome }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.emergency]} onPress={onEmergency} accessibilityRole="button">
        <AlertTriangle size={24} color={Colors.white} />
        <Text style={styles.label}>Emergency</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.home]} onPress={onHeadingHome} accessibilityRole="button">
        <Home size={24} color={Colors.white} />
        <Text style={styles.label}>Heading Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergency: { backgroundColor: Colors.danger },
  home: { backgroundColor: Colors.primary },
  label: { color: Colors.white, fontWeight: '600', marginLeft: 8 },
});
