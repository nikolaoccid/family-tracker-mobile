import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Button from './Button';
import Colors from './colors';
import { errorMessage } from '@/shared/api/errors';

interface Props {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
}

/** The one place a screen shows a failed load. */
export default function ErrorState({ error, title = 'Something went wrong', onRetry }: Props) {
  return (
    <View style={styles.container} accessible accessibilityRole="alert">
      <AlertTriangle size={40} color={Colors.danger} />
      <Text style={styles.title}>{title}</Text>
      {error ? <Text style={styles.message}>{errorMessage(error)}</Text> : null}
      {onRetry ? <Button title="Try again" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.light.text, textAlign: 'center' },
  message: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center' },
});
