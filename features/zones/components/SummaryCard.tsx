import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import { formatDuration } from '../model/analytics';

interface Props {
  title: string;
  minutes: number;
  caption: string;
}

export function SummaryCard({ title, minutes, caption }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <BarChart2 size={24} color={Colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{formatDuration(minutes)}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 20, marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginLeft: 12 },
  content: { alignItems: 'center' },
  value: { fontSize: 36, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  caption: { fontSize: 14, color: Colors.light.subtext },
});
