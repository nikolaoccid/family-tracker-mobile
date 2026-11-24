import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import FamilyMemberItem from '@/components/FamilyMemberItem';

export default function ChatScreen() {
  const { user } = useAuthStore();
  const { family } = useFamilyStore();
  const router = useRouter();

  const members = family?.members?.filter((m) => m.id !== user?.id) || [];

  const handleOpenChat = (memberId: string, name: string) => {
    router.push({
      pathname: '/chat/private',
      params: { targetUserId: memberId, name },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FamilyMemberItem
            member={item}
            isCurrentUser={false}
            isAdmin={false}
            onPress={() => handleOpenChat(item.id, item.name)}
          />
        )}
        ListEmptyComponent={<Text>No other family members</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
});
