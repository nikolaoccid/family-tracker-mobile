import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/shared/ui/colors';

export function MembersSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingBottom: 80 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 16, paddingHorizontal: 24 },
});
