import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Plus,
  Users,
  QrCode,
  MoreVertical,
  Crown,
  Trash2,
  UserPlus,
  MapPin,
  BarChart2,
  Clock,
  ChevronRight
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import FamilyMemberItem from '@/components/FamilyMemberItem';
import Button from '@/components/Button';
import {FamilyMember, User} from "@/types";

export default function FamilyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { family, fetchFamily, updateMemberRole, removeFamilyMember, deleteFamily } = useFamilyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | User | null>(null);
  const initialLoadDoneRef = useRef(false);

  // Load family data if not already loaded
  useEffect(() => {
    // Only load data once to prevent infinite loops
    if (initialLoadDoneRef.current) return;

    const loadData = async () => {
      if (!family) {
        setIsLoading(true);
        try {
          await fetchFamily();
          initialLoadDoneRef.current = true;
        } catch (error) {
          console.error('Error loading family data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        initialLoadDoneRef.current = true;
      }
    };

    loadData();
  }, [family, fetchFamily]);

  // Check if current user is admin
  const isAdmin = (user && family?.members.some(m => m.id === user.id && m.role === 'admin')) ?? false;

  // Handle create family
  const handleCreateFamily = () => {
    router.push('/family/create');
  };

  // Handle join family
  const handleJoinFamily = () => {
    Alert.alert(
      "Join a Family",
      "To join a family, you need an invitation link or QR code from a family admin.",
      [
        { text: "OK", style: "default" }
      ]
    );
  };

  // Handle add member
  const handleAddMember = () => {
    router.push('/family/add-member');
  };

  // Handle location history
  const handleLocationHistory = () => {
    router.push('/location/history');
  };

  // Handle zone analytics
  const handleZoneAnalytics = () => {
    router.push('/zones/analytics');
  };

  // Handle sharing schedules
  const handleSharingSchedules = () => {
    if (user?.isPremium) {
      router.push('/schedule/create');
    } else {
      Alert.alert(
        "Premium Feature",
        "Sharing schedules is a premium feature. Upgrade your subscription to access this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => router.push('/subscription')
          }
        ]
      );
    }
  };

  // Handle promote to admin
  const handlePromoteToAdmin = async (member: FamilyMember) => {
    if (!family || !isAdmin) return;

    Alert.alert(
      "Make Admin",
      `Are you sure you want to make ${member.name} an admin? They will have full control over the family group.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Make Admin",
          style: "default",
          onPress: async () => {
            setIsLoading(true);
            try {
              await updateMemberRole(member.id, 'admin');
              Alert.alert("Success", `${member.name} is now an admin.`);
            } catch (error) {
              console.error('Error promoting member:', error);
              Alert.alert("Error", "Failed to update member role. Please try again.");
            } finally {
              setIsLoading(false);
              setSelectedMember(null);
            }
          }
        }
      ]
    );
  };

  const handleDemoteToMember = async (member: FamilyMember) => {
    if (!family || !isAdmin) return;

    Alert.alert(
      "Remove Admin",
      `Are you sure you want to remove admin rights from ${member.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Admin",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await updateMemberRole(member.id, 'member');
              Alert.alert("Success", `${member.name} is now a member.`);
            } catch (error) {
              console.error('Error demoting member:', error);
              Alert.alert("Error", "Failed to update member role. Please try again.");
            } finally {
              setIsLoading(false);
              setSelectedMember(null);
            }
          }
        }
      ]
    );
  };

  // Handle remove member
  const handleRemoveMember = async (member: FamilyMember) => {
    if (!family || !isAdmin) return;

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.name} from the family?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeFamilyMember(member.id);
              Alert.alert("Success", `${member.name} has been removed from the family.`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert("Error", "Failed to remove member. Please try again.");
            } finally {
              setIsLoading(false);
              setSelectedMember(null);
            }
          }
        }
      ]
    );
  };

  // Handle delete family
  const handleDeleteFamily = async () => {
    if (!family || !isAdmin) return;

    Alert.alert(
      "Delete Family",
      "Are you sure you want to delete this family? This action cannot be undone and all members will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteFamily();
              Alert.alert("Success", "Family has been deleted.");
            } catch (error) {
              console.error('Error deleting family:', error);
              Alert.alert("Error", "Failed to delete family. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle view profile
  const handleViewProfile = (memberId: string) => {
    router.push(`/profile/view/${memberId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Render no family state
  if (!family || family.members.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.noFamilyContainer}>
          <View style={styles.iconContainer}>
            <Users size={60} color={Colors.primary} />
          </View>

          <Text style={styles.noFamilyTitle}>No Family Group</Text>
          <Text style={styles.noFamilyText}>
            Create a family group or join an existing one to start tracking your loved ones.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Create Family"
              onPress={handleCreateFamily}
              fullWidth
              style={styles.createButton}
            />

            <Button
              title="Join Family"
              onPress={handleJoinFamily}
              variant="outline"
              fullWidth
              style={styles.joinButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.familyName}>{family.name}</Text>
            <Text style={styles.memberCount}>{family.members.length} members</Text>
          </View>

          {isAdmin && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  Alert.alert(
                    "Family Options",
                    "Choose an action:",
                    [
                      {
                        text: "Add Member",
                        onPress: handleAddMember
                      },
                      {
                        text: "Delete Family",
                        onPress: handleDeleteFamily,
                        style: "destructive"
                      },
                      {
                        text: "Cancel",
                        style: "cancel"
                      }
                    ]
                  );
                }}
              >
                <MoreVertical size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Family Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Family Analytics</Text>
          <View style={styles.analyticsCards}>
            <TouchableOpacity
              style={styles.analyticsCard}
              onPress={handleLocationHistory}
            >
              <View style={styles.analyticsIconContainer}>
                <MapPin size={24} color={Colors.primary} />
              </View>
              <Text style={styles.analyticsTitle}>Location History</Text>
              <Text style={styles.analyticsDescription}>
                View where family members have been
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyticsCard}
              onPress={handleZoneAnalytics}
            >
              <View style={styles.analyticsIconContainer}>
                <BarChart2 size={24} color={Colors.primary} />
              </View>
              <Text style={styles.analyticsTitle}>Zone Analytics</Text>
              <Text style={styles.analyticsDescription}>
                Track time spent in safe zones
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sharing Schedules Section */}
        <View style={styles.schedulesSection}>
          <Text style={styles.sectionTitle}>Sharing Options</Text>
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={handleSharingSchedules}
          >
            <View style={styles.scheduleIconContainer}>
              <Clock size={24} color={Colors.primary} />
            </View>
            <View style={styles.scheduleContent}>
              <Text style={styles.scheduleTitle}>Sharing Schedules</Text>
              <Text style={styles.scheduleDescription}>
                Set up automatic location sharing based on time and day
              </Text>
              {!user?.isPremium && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>Premium</Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={Colors.light.icon} />
          </TouchableOpacity>
        </View>

        {/* Members Section */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          {family.members.map((item) => (
            <FamilyMemberItem
              key={item.id}
              member={item}
              isCurrentUser={item.id === user?.id}
              isAdmin={isAdmin}
              onPress={() => handleViewProfile(item.id)}
              onPromote={() => handlePromoteToAdmin(item)}
              onDelete={() => handleRemoveMember(item)}
              onDemote={()=> handleDemoteToMember(item)}
            />
          ))}
        </View>
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddMember}
        >
          <UserPlus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  familyName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  memberCount: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  analyticsDescription: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  schedulesSection: {
    marginBottom: 24,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  premiumTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  premiumTagText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: '600',
  },
  membersSection: {
    paddingBottom: 80,
  },
  noFamilyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noFamilyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  noFamilyText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  createButton: {
    marginBottom: 12,
  },
  joinButton: {},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
