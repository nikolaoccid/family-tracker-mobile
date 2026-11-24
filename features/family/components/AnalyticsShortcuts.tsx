import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart2, MapPin } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';

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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 16, paddingHorizontal: 24 },
  cards: { flexDirection: 'row', paddingHorizontal: 16 },
  card: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  text: { fontSize: 12, color: Colors.light.subtext },
});
