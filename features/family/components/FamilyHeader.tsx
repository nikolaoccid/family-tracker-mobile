import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MoreVertical } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';

interface Props {
  name: string;
  memberCount: number;
  isAdmin: boolean;
  onDeleteFamily: () => void;
}

export function FamilyHeader({ name, memberCount, isAdmin, onDeleteFamily }: Props) {
  const router = useRouter();
  const openOptions = () =>
    Alert.alert('Family Options', 'Choose an action:', [
      { text: 'Add Member', onPress: () => router.push('/family/add-member') },
      { text: 'Delete Family', onPress: onDeleteFamily, style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.count}>{memberCount} members</Text>
      </View>
      {isAdmin && (
        <TouchableOpacity style={styles.button} onPress={openOptions} accessibilityLabel="Family options">
          <MoreVertical size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  name: { fontSize: 24, fontWeight: '700', color: Colors.light.text },
  count: { fontSize: 14, color: Colors.light.subtext },
  button: { padding: 8, marginLeft: 8 },
});
