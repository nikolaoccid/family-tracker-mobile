import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import type { SafeZone } from '../model/zone';

interface Props {
  zones: readonly SafeZone[];
  selectedId: string | null;
  onToggle: (zone: SafeZone) => void;
}

export function ZonePicker({ zones, selectedId, onToggle }: Props) {
  if (zones.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Select Zone</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {zones.map((zone) => {
          const selected = zone.id === selectedId;
          return (
            <TouchableOpacity
              key={zone.id}
              style={[styles.item, { backgroundColor: selected ? zone.color : `${zone.color}40` }]}
              onPress={() => onToggle(zone)}
            >
              <MapPin size={20} color={selected ? '#FFFFFF' : zone.color} />
              <Text style={[styles.name, { color: selected ? '#FFFFFF' : Colors.light.text }]} numberOfLines={1}>
                {zone.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
  list: { paddingBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 12 },
  name: { fontSize: 14, marginLeft: 6 },
});
