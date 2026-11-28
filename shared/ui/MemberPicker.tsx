import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';

interface Props {
  members: readonly { id: string; name: string }[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

export function MemberPicker({ members, selectedId, onSelect }: Props) {
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
                <User size={20} color={selected ? Colors.white : Colors.primary} />
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
  section: screenStyles.pickerSection,
  title: screenStyles.pickerTitle,
  list: screenStyles.pickerList,
  item: { alignItems: 'center', marginRight: 16, width: 80 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconSelected: { backgroundColor: Colors.primary },
  name: { fontSize: 14, color: Colors.light.text, textAlign: 'center' },
  nameSelected: { fontWeight: '600' },
});
