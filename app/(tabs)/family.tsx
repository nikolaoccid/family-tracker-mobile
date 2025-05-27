import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserPlus, Users, Trash2, UserCog } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import FamilyMemberItem from '@/components/FamilyMemberItem';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function FamilyScreen() {
  const router = useRouter();
  const { family, isLoading, deleteFamily, removeFamilyMember, updateMemberRole } = useFamilyStore();
  const { user } = useAuthStore();

  const [showQRCode, setShowQRCode] = useState(false);

  const handleAddMember = () => {
    router.push('/family/add-member');
  };

  const handleCreateFamily = () => {
    router.push('/family/create');
  };

  const handleMemberPress = (memberId: string) => {
    router.push(`/profile/view/${memberId}`);
  };

  const isAdmin = user && family?.members.find(m => m.id === user.id)?.role === 'admin';

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (!isAdmin) return;

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from the family?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => removeFamilyMember(memberId),
          style: "destructive"
        }
      ]
    );
  };

  const handlePromoteToAdmin = (memberId: string, memberName: string) => {
    if (!isAdmin) return;

    Alert.alert(
      "Promote to Admin",
      `Are you sure you want to make ${memberName} an admin of the family?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Promote",
          onPress: () => updateMemberRole(memberId, 'admin')
        }
      ]
    );
  };

  const handleDeleteFamily = () => {
    if (!isAdmin) return;

    Alert.alert(
      "Delete Family",
      "Are you sure you want to delete this family? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteFamily(),
          style: "destructive"
        }
      ]
    );
  };

  // If no family exists, show a different UI
  if (!family) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <Users size={64} color={Colors.light.icon} />
        <Text style={styles.emptyTitle}>No Family Group</Text>
        <Text style={styles.emptyText}>
          Create a family group to start tracking your loved ones
        </Text>
        <Button
          title="Create Family Group"
          onPress={handleCreateFamily}
          style={styles.createButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Family</Text>
          {family && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{family.members.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMember}
        >
          <UserPlus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Card title={family.name} subtitle={`Created ${new Date(family.createdAt).toLocaleDateString()}`}>
        <View style={styles.familyInfo}>
          <View style={styles.infoItem}>
            <Users size={16} color={Colors.primary} />
            <Text style={styles.infoText}>
              {family.members.length} members
            </Text>
          </View>
          <Text style={styles.infoText}>
            {family.members.filter(m => m.isSharing).length} sharing location
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteFamily}
          >
            <Trash2 size={16} color={Colors.danger} />
            <Text style={styles.deleteText}>Delete Family</Text>
          </TouchableOpacity>
        )}
      </Card>

      <FlatList
        data={family.members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FamilyMemberItem
            member={item}
            onPress={() => handleMemberPress(item.id)}
            isCurrentUser={user?.id === item.id}
            isAdmin={isAdmin}
            onDelete={isAdmin && item.id !== user?.id ? () => handleDeleteMember(item.id, item.name) : undefined}
            onPromote={isAdmin && item.id !== user?.id && item.role !== 'admin' ?
              () => handlePromoteToAdmin(item.id, item.name) : undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  familyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 8,
  },
  deleteText: {
    color: Colors.danger,
    marginLeft: 8,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
  },
});
