import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { FamilyMemberItem, useFamily } from '@/features/family';
import { QueryBoundary } from '@/shared/ui';
import { useRouter } from 'expo-router';

export function ChatTabScreen() {
  const user = useAuthStore((s) => s.user);
  const familyQuery = useFamily();
  const router = useRouter();

  const handleOpenChat = (memberId: string, name: string) => {
    router.push({
      pathname: '/chat/private',
      params: { targetUserId: memberId, name },
    });
  };

  return (
    <View style={styles.container}>
      <QueryBoundary query={familyQuery}>
        {(family) => (
          <FlatList
            data={(family?.members ?? []).filter((m) => m.id !== user?.id)}
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
        )}
      </QueryBoundary>
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
