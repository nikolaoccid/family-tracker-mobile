import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';

interface Props {
  message: string;
  onRetry: () => void;
}

export function TransactionError({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <AlertCircle size={24} color={Colors.danger} />
      <Text style={styles.title}>Transaction Failed</Text>
      <Text style={styles.text}>{message || 'There was a problem processing your payment. Please try again.'}</Text>
      <TouchableOpacity style={styles.retry} onPress={onRetry}>
        <RefreshCw size={16} color={Colors.primary} />
        <Text style={styles.retryText}>Retry Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.danger}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});
