import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart2, MapPin } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles, cardShadow } from '@/shared/ui/screenStyles';

const cards = [
  { href: '/location/history', Icon: MapPin, title: 'Location History', text: 'View where family members have been' },
  { href: '/zones/analytics', Icon: BarChart2, title: 'Zone Analytics', text: 'Track time spent in safe zones' },
] as const;

export function AnalyticsShortcuts() {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Family Analytics</Text>
      <View style={styles.cards}>
        {cards.map(({ href, Icon, title, text }) => (
          <TouchableOpacity key={href} style={styles.card} onPress={() => router.push(href)} accessibilityRole="button">
            <View style={styles.icon}>
              <Icon size={24} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: screenStyles.section,
  sectionTitle: screenStyles.sectionTitle,
  cards: { flexDirection: 'row', paddingHorizontal: 16 },
  card: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    ...cardShadow,
  },
  icon: { ...screenStyles.iconBadge, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  text: { fontSize: 12, color: Colors.light.subtext },
});
