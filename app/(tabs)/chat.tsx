import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const { user } = useAuthStore();
  const { family } = useFamilyStore();
  const router = useRouter();

  const members = family?.members?.filter((m) => m.id !== user?.id) || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.memberItem}
            onPress={() => {
              router.push({
                pathname: '/chat/private',
                params: { targetUserId: item.id, name: item.name },
              });
            }}
          >
            <Text style={styles.memberText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No other family members</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  memberItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  memberText: { fontSize: 18 },
});
