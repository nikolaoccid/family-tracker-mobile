import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Users } from 'lucide-react-native';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';

export function NoFamilyState() {
  const router = useRouter();
  const explainJoin = () =>
    Alert.alert('Join a Family', 'To join a family, you need an invitation link or QR code from a family admin.');
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Users size={60} color={Colors.primary} />
      </View>
      <Text style={styles.title}>No Family Group</Text>
      <Text style={styles.text}>Create a family group or join an existing one to start tracking your loved ones.</Text>
      <View style={styles.buttons}>
        <Button title="Create Family" onPress={() => router.push('/family/create')} fullWidth />
        <Button title="Join Family" onPress={explainJoin} variant="outline" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 12, textAlign: 'center' },
  text: { fontSize: 16, color: Colors.light.subtext, textAlign: 'center', marginBottom: 32 },
  buttons: { width: '100%', gap: 12 },
});
