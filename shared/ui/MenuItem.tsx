import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';

interface Props {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  /** `danger` renders the destructive style and hides the chevron. */
  variant?: 'default' | 'danger';
}

export function MenuItem({ label, Icon, onPress, variant = 'default' }: Props) {
  const danger = variant === 'danger';
  const tint = danger ? Colors.danger : Colors.primary;
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} accessibilityRole="button">
      <View style={[styles.icon, { backgroundColor: `${tint}20` }]}>
        <Icon size={20} color={tint} />
      </View>
      <Text style={[styles.label, danger && { color: Colors.danger }]}>{label}</Text>
      {!danger && <ChevronRight size={20} color={Colors.light.icon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { flex: 1, fontSize: 16, color: Colors.light.text },
});
