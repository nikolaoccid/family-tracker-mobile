import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Colors from './colors';

export default function LoadingState() {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
