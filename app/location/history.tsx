import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Calendar, User, MapPin, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';
import MockMap from "@/components/MockMap";
import {FamilyMember, User as UserType} from "@/types";
import Map from "@/components/Map";

const { width } = Dimensions.get('window');

export default function LocationHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = params;
  const { user: currentUser } = useAuthStore();
  const { family, locationHistory, fetchLocationHistory, clearLocationHistory } = useFamilyStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FamilyMember | UserType | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const [selectedDateRange, setSelectedDateRange] = useState('week');

  // Clear location history when leaving the screen
  useEffect(() => {
    return () => {
      clearLocationHistory();
    };
  }, [clearLocationHistory]);

  // Set selected user based on userId param or current user
  useEffect(() => {
    if (family) {
      if (userId) {
        const member = family.members.find(m => m.id === userId);
        if (member) {
          setSelectedUser(member);
        } else {
          // If user not found in family, default to current user
          setSelectedUser(currentUser);
        }
      } else {
        // If no userId provided, default to current user
        setSelectedUser(currentUser);
      }
    }
  }, [userId, currentUser]);

  // Fetch location history when selected user or date range changes
  useEffect(() => {
    if (selectedUser) {
      loadLocationHistory();
    }
  }, [selectedUser, dateRange]);

  const loadLocationHistory = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await fetchLocationHistory(
        selectedUser.id,
        dateRange.startDate,
        dateRange.endDate
      );
    } catch (error) {
      console.error('Error loading location history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDateRange = (range : 'day' | 'month' | 'week') => {
    let startDate;
    const endDate = new Date().toISOString().split('T')[0]; // today

    switch (range) {
      case 'day':
        startDate = new Date().toISOString().split('T')[0]; // today
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    setSelectedDateRange(range);
    setDateRange({ startDate, endDate });
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Location History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User selector */}
        {family && family.members.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Family Member</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.userList}
            >
              {family.members.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.userItem,
                    selectedUser?.id === member.id && styles.userItemSelected
                  ]}
                  onPress={() => handleSelectUser(member)}
                >
                  <View style={styles.userIconContainer}>
                    <User size={20} color={selectedUser?.id === member.id ? '#FFFFFF' : Colors.primary} />
                  </View>
                  <Text
                    style={[
                      styles.userName,
                      selectedUser?.id === member.id && styles.userNameSelected
                    ]}
                    numberOfLines={1}
                  >
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date range selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                selectedDateRange === 'day' && styles.dateRangeButtonSelected
              ]}
              onPress={() => handleSelectDateRange('day')}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  selectedDateRange === 'day' && styles.dateRangeTextSelected
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                selectedDateRange === 'week' && styles.dateRangeButtonSelected
              ]}
              onPress={() => handleSelectDateRange('week')}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  selectedDateRange === 'week' && styles.dateRangeTextSelected
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                selectedDateRange === 'month' && styles.dateRangeButtonSelected
              ]}
              onPress={() => handleSelectDateRange('month')}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  selectedDateRange === 'month' && styles.dateRangeTextSelected
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInfoContainer}>
            <Calendar size={16} color={Colors.light.subtext} />
            <Text style={styles.dateInfoText}>
              {formatDate(new Date(dateRange.startDate))} - {formatDate(new Date(dateRange.endDate))}
            </Text>
          </View>
        </View>

        {/* Map view */}
        <View style={styles.mapContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : locationHistory.length > 0 ? (
            <>
              <Map familyLocations={locationHistory} />

              <View style={styles.mapOverlay}>
                <View style={styles.mapInfoContainer}>
                  <Text style={styles.mapInfoTitle}>
                    {selectedUser?.name}'s Location History
                  </Text>
                  <Text style={styles.mapInfoSubtitle}>
                    {locationHistory.length} locations recorded
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <MapPin size={40} color={Colors.light.subtext} />
              <Text style={styles.emptyTitle}>No Location Data</Text>
              <Text style={styles.emptyText}>
                No location history found for this time period.
              </Text>
            </View>
          )}
        </View>

        {/* Location list */}
        {locationHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Locations</Text>
            {locationHistory.slice(0, 10).map((location, index) => (
              <View key={index} style={styles.locationItem}>
                <View style={styles.locationIconContainer}>
                  <MapPin size={20} color={Colors.primary} />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationCoords}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  <View style={styles.locationTimeContainer}>
                    <Clock size={14} color={Colors.light.subtext} />
                    <Text style={styles.locationTime}>
                      {formatDate(new Date(location.timestamp))}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {locationHistory.length > 10 && (
              <Text style={styles.moreLocationsText}>
                + {locationHistory.length - 10} more locations
              </Text>
            )}
          </View>
        )}

        {/* Export button for premium users */}
        {currentUser?.isPremium && locationHistory.length > 0 && (
          <Button
            title="Export Location Data"
            onPress={() => {}}
            variant="outline"
            fullWidth
            style={styles.exportButton}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  userList: {
    paddingBottom: 8,
  },
  userItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  userItemSelected: {
    opacity: 1,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  userName: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  userNameSelected: {
    fontWeight: '600',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    marginRight: 8,
  },
  dateRangeButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  dateRangeTextSelected: {
    color: '#FFFFFF',
  },
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 8,
  },
  mapContainer: {
    height: 300,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  mapInfoContainer: {},
  mapInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  mapInfoSubtitle: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationCoords: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  locationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTime: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
  moreLocationsText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 8,
  },
  exportButton: {
    marginHorizontal: 24,
    marginTop: 8,
    maxWidth: 90
  },
});
