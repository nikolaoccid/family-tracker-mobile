import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { FamilyMember } from '../model/family';
import { Colors } from '@/shared/ui/theme';
import { Avatar } from '@/shared/ui/Avatar';
import { Check } from 'lucide-react-native';

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberIds: string[];
  onSelectMember: (id: string) => void;
}

export function MemberSelector({ members, selectedMemberIds, onSelectMember }: MemberSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {members.map((member) => {
        const isSelected = selectedMemberIds.includes(member.id);

        return (
          <TouchableOpacity
            key={member.id}
            style={[styles.memberItem, isSelected && styles.selectedItem]}
            onPress={() => onSelectMember(member.id)}
          >
            <View style={styles.avatarContainer}>
              <Avatar source={member.avatar} name={member.name} size={50} />
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check size={14} color={Colors.white} />
                </View>
              )}
            </View>
            <Text style={[styles.memberName, isSelected && styles.selectedText]} numberOfLines={1}>
              {member.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  selectedItem: {
    opacity: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  memberName: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
