import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from 'lucide-react-native';
import Colors from './colors';

interface Props {
  members: readonly { id: string; name: string }[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export default function MemberPicker({ members, selectedId, onSelect }: Props) {
  if (members.length < 2) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Select Family Member</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {members.map((member) => {
          const selected = member.id === selectedId;
          return (
            <TouchableOpacity key={member.id} style={styles.item} onPress={() => onSelect(member.id)}>
              <View style={[styles.icon, selected && styles.iconSelected]}>
                <User size={20} color={selected ? '#FFFFFF' : Colors.primary} />
              </View>
              <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
                {member.name}
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
  item: { alignItems: 'center', marginRight: 16, width: 80 },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}20`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  iconSelected: { backgroundColor: Colors.primary },
  name: { fontSize: 14, color: Colors.light.text, textAlign: 'center' },
  nameSelected: { fontWeight: '600' },
});
