import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserPlus, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import FamilyMemberItem from '@/components/FamilyMemberItem';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function FamilyScreen() {
  const router = useRouter();
  const { family, isLoading } = useFamilyStore();
  
  const [showQRCode, setShowQRCode] = useState(false);

  const handleAddMember = () => {
    router.push('/family/add-member');
  };

  const handleMemberPress = (memberId: string) => {
    // In a real app, this would navigate to member details
    console.log('Member pressed:', memberId);
  };

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
      
      {family ? (
        <>
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
          </Card>
          
          <FlatList
            data={family.members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FamilyMemberItem
                member={item}
                onPress={() => handleMemberPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Users size={64} color={Colors.light.icon} />
          <Text style={styles.emptyTitle}>No Family Group</Text>
          <Text style={styles.emptyText}>
            Create a family group to start tracking your loved ones
          </Text>
          <Button
            title="Create Family Group"
            onPress={handleAddMember}
            style={styles.createButton}
          />
        </View>
      )}
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