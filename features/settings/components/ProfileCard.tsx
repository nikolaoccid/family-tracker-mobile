import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { User } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Colors } from '@/shared/ui/theme';

export function ProfileCard({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      <Avatar source={user.avatar} name={user.name} size={60} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.isPremium ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Premium</Text>
          </View>
        ) : null}
      </View>
      <ChevronRight size={20} color={Colors.light.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.light.subtext },
  badge: { backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { color: Colors.light.text, fontSize: 12, fontWeight: '600' },
});
