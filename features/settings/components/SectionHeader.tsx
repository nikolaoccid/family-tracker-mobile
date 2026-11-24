import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';

export function SectionHeader({ Icon, title }: { Icon: LucideIcon; title: string }) {
  return (
    <View style={styles.header}>
      <Icon size={20} color={Colors.primary} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginLeft: 8 },
});
