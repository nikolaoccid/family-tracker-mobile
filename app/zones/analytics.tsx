import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Calendar, User, MapPin, Clock, BarChart2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';
import {FamilyMember, SafeZone} from "@/types";

const { width } = Dimensions.get('window');

export default function ZoneAnalyticsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = params;
  const { user: currentUser } = useAuthStore();
  const { family, safeZones, zoneAnalytics, fetchAllZonesAnalytics, fetchZoneAnalytics, clearZoneAnalytics } = useFamilyStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const [selectedDateRange, setSelectedDateRange] = useState('week');

  // Clear analytics when leaving the screen
  useEffect(() => {
    return () => {
      clearZoneAnalytics();
    };
  }, [clearZoneAnalytics]);

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
  }, [userId, family, currentUser]);

  // Fetch zone analytics when selected user, zone, or date range changes
  useEffect(() => {
    if (selectedUser) {
      loadZoneAnalytics();
    }
  }, [selectedUser, selectedZone, dateRange]);

  const loadZoneAnalytics = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      if (selectedZone) {
        await fetchZoneAnalytics(
          selectedZone?.id,
          dateRange.startDate,
          dateRange.endDate,
          selectedUser.id
        );
      } else {
        await fetchAllZonesAnalytics(
          dateRange.startDate,
          dateRange.endDate,
          selectedUser.id
        );
      }
    } catch (error) {
      console.error('Error loading zone analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDateRange = (range: 'day' | 'week' | 'month') => {
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

  const handleSelectUser = (user: FamilyMember) => {
    setSelectedUser(user);
  };

  const handleSelectZone = (zone: SafeZone) => {
    setSelectedZone(zone === selectedZone ? null : zone);
  };

  // Format minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
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
        <Text style={styles.title}>Zone Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User selector */}
        {family && family.members?.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Family Member</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.userList}
            >
              {family?.members?.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.userItem,
                    selectedUser?.id === member.id && styles.userItemSelected
                  ]}
                  onPress={() => handleSelectUser(member)}
                >
                  <View style={[
                    styles.userIconContainer,
                    selectedUser?.id === member.id && styles.userIconContainerSelected
                  ]}>
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

        {/* Zone selector */}
        {safeZones && safeZones?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Zone</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.zoneList}
            >
              {safeZones?.map(zone => (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zoneItem,
                    { backgroundColor: selectedZone?.id === zone.id ? zone.color : `${zone.color}40` }
                  ]}
                  onPress={() => handleSelectZone(zone)}
                >
                  <MapPin
                    size={20}
                    color={selectedZone?.id === zone.id ? '#FFFFFF' : zone.color}
                  />
                  <Text
                    style={[
                      styles.zoneName,
                      { color: selectedZone?.id === zone.id ? '#FFFFFF' : Colors.light.text }
                    ]}
                    numberOfLines={1}
                  >
                    {zone.name}
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

        {/* Analytics content */}
        <View style={styles.analyticsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : zoneAnalytics?.length > 0 ? (
            <>
              {/* Summary card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <BarChart2 size={24} color={Colors.primary} />
                  <Text style={styles.summaryTitle}>
                    {selectedZone
                      ? `Time in ${selectedZone.name}`
                      : `Total Time in All Zones`
                    }
                  </Text>
                </View>

                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValue}>
                    {formatDuration(zoneAnalytics.reduce((sum, zone) => sum + zone.totalTimeSpent, 0))}
                  </Text>
                  <Text style={styles.summarySubtext}>
                    {selectedUser?.name}'s total time spent
                  </Text>
                </View>
              </View>

              {/* Zone breakdown */}
              {!selectedZone && zoneAnalytics?.length >= 1 && (
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>Zone Breakdown</Text>

                  {zoneAnalytics.map(zone => {
                    const safeZone = safeZones.find(sz => sz.id === zone.zoneId);
                    const zoneColor = safeZone ? safeZone.color : Colors.primary;

                    return (
                      <TouchableOpacity
                        key={zone.zoneId}
                        style={styles.zoneBreakdownItem}
                        onPress={() => safeZone && handleSelectZone(safeZone)}
                      >
                        <View style={[styles.zoneColorIndicator, { backgroundColor: zoneColor }]} />
                        <View style={styles.zoneBreakdownInfo}>
                          <Text style={styles.zoneBreakdownName}>{zone.zoneName}</Text>
                          <Text style={styles.zoneBreakdownTime}>
                            {formatDuration(zone.totalTimeSpent)}
                          </Text>
                        </View>
                        <View style={styles.zoneBreakdownPercentage}>
                          <Text style={styles.zoneBreakdownPercentageText}>
                            {Math.round((zone.totalTimeSpent / zoneAnalytics.reduce((sum, z) => sum + z.totalTimeSpent, 0)) * 100)}%
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Daily breakdown */}
              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Daily Breakdown</Text>

                {zoneAnalytics[0]?.timeByDay?.map(day => (
                  <View key={day.date} style={styles.dayBreakdownItem}>
                    <Text style={styles.dayBreakdownDate}>
                      {formatDate(new Date(day.date))}
                    </Text>
                    <View style={styles.dayBreakdownBarContainer}>
                      <View
                        style={[
                          styles.dayBreakdownBar,
                          {
                            width: `${Math.min(100, (day.minutes / (8 * 60)) * 100)}%`,
                            backgroundColor: selectedZone ? selectedZone.color : Colors.primary
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.dayBreakdownTime}>
                      {formatDuration(day.minutes)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Recent visits */}
              {selectedZone && zoneAnalytics[0]?.visits?.length > 0 && (
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>Recent Visits</Text>

                  {zoneAnalytics[0]?.visits?.slice(0, 5)?.map((visit, index) => (
                    <View key={index} style={styles.visitItem}>
                      <View style={styles.visitTimeContainer}>
                        <Text style={styles.visitDate}>
                          {formatDate(new Date(visit.entryTime))}
                        </Text>
                        <Text style={styles.visitTime}>
                          {new Date(visit.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(visit.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={styles.visitDuration}>
                        {formatDuration(visit.duration)}
                      </Text>
                    </View>
                  ))}

                  {zoneAnalytics[0]?.visits?.length > 5 && (
                    <Text style={styles.moreVisitsText}>
                      + {zoneAnalytics[0].visits?.length - 5} more visits
                    </Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <BarChart2 size={40} color={Colors.light.subtext} />
              <Text style={styles.emptyTitle}>No Analytics Data</Text>
              <Text style={styles.emptyText}>
                {selectedZone
                  ? `No time spent in ${selectedZone.name} during this period.`
                  : "No time spent in any zones during this period."
                }
              </Text>
            </View>
          )}
        </View>

        {/* Export button for premium users */}
        {currentUser?.isPremium && zoneAnalytics?.length > 0 && (
          <Button
            title="Export Analytics Data"
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
  zoneList: {
    paddingBottom: 8,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  zoneName: {
    fontSize: 14,
    marginLeft: 6,
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
  analyticsContainer: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
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
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  breakdownSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  zoneBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  zoneColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  zoneBreakdownInfo: {
    flex: 1,
  },
  zoneBreakdownName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  zoneBreakdownTime: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  zoneBreakdownPercentage: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneBreakdownPercentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  dayBreakdownItem: {
    marginBottom: 16,
  },
  dayBreakdownDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  dayBreakdownBarContainer: {
    height: 12,
    backgroundColor: `${Colors.primary}20`,
    borderRadius: 6,
    marginBottom: 4,
  },
  dayBreakdownBar: {
    height: 12,
    borderRadius: 6,
  },
  dayBreakdownTime: {
    fontSize: 12,
    color: Colors.light.subtext,
    alignSelf: 'flex-end',
  },
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  visitTimeContainer: {
    flex: 1,
  },
  visitDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  visitTime: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  visitDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  moreVisitsText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 12,
  },
  exportButton: {
    marginHorizontal: 24,
    marginTop: 8,
  },
});
