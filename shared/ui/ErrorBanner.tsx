import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from './theme';
import { screenStyles } from './screenStyles';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={screenStyles.errorContainer}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: Colors.danger, fontSize: 14 },
});
