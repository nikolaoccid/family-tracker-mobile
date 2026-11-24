import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import Colors from '@/shared/ui/colors';

/** Header button for free users; renders nothing for premium users or signed-out state. */
export function UpgradeButton() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  if (!user || user.isPremium) return null;
  return (
    <TouchableOpacity style={styles.button} onPress={() => router.push('/subscription')} accessibilityRole="button">
      <Crown size={16} color={Colors.light.text} />
      <Text style={styles.label}>Upgrade</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
  },
  label: { color: Colors.light.text, fontWeight: '600', marginLeft: 4, fontSize: 12 },
});
