import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles, cardShadow } from '@/shared/ui/screenStyles';

/** Entry point to sharing schedules; a premium feature, so free users get an upgrade prompt. */
export function SharingScheduleCard({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();

  const open = () => {
    if (isPremium) {
      router.push('/schedule/create');
      return;
    }
    Alert.alert(
      'Premium Feature',
      'Sharing schedules is a premium feature. Upgrade your subscription to access this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/subscription') },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sharing Options</Text>
      <TouchableOpacity style={styles.card} onPress={open} accessibilityRole="button">
        <View style={styles.icon}>
          <Clock size={24} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Sharing Schedules</Text>
          <Text style={styles.text}>Set up automatic location sharing based on time and day</Text>
          {!isPremium && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Premium</Text>
            </View>
          )}
        </View>
        <ChevronRight size={20} color={Colors.light.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: screenStyles.section,
  sectionTitle: screenStyles.sectionTitle,
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    ...cardShadow,
  },
  icon: { ...screenStyles.iconBadge, marginRight: 16 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  text: { fontSize: 12, color: Colors.light.subtext },
  tag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  tagText: { color: Colors.light.text, fontSize: 10, fontWeight: '600' },
});
