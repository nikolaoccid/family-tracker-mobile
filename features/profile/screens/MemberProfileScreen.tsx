import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail, Phone, Calendar, Crown, MapPin, BatteryMedium } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { formatDate, formatDistanceToNow } from '@/utils/date';
import { FamilyMember } from '@/types';

export default function MemberProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { family } = useFamilyStore();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (family && id) {
      const foundMember = family.members.find(m => m.id === id);
      setMember(foundMember || null);
    }
    setLoading(false);
  }, [family, id]);

  const isCurrentUser = user?.id === id;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Text style={styles.errorText}>Member not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const getBatteryColor = () => {
    if (!member.batteryLevel) return Colors.light.icon;
    if (member.batteryLevel < 20) return Colors.danger;
    if (member.batteryLevel < 50) return Colors.warning;
    return Colors.success;
  };

  const isOnline = member.isSharing && member.lastSeen &&
    new Date().getTime() - new Date(member.lastSeen).getTime() < 5 * 60 * 1000; // 5 minutes

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
        <Text style={styles.title}>Profile</Text>
        {isCurrentUser && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar
            source={member.avatar}
            name={member.name}
            size={100}
            showBadge={!!isOnline}
            badgeColor={Colors.success}
          />
          <Text style={styles.name}>{member.name?.length > 23 ? `${member.name.substring(0, 23)}...` : member.name}</Text>
          {member.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Family Admin</Text>
            </View>
          )}
          {member.isPremium ? (
            <View style={styles.premiumBadge}>
              <Crown size={14} color={Colors.light.text} />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Mail size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{member.email}</Text>
            </View>
          </View>

          {member.phone ? (
            <View style={styles.infoItem}>
              <Phone size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{member.phone}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoItem}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(new Date(member.createdAt))}</Text>
            </View>
          </View>

          {member.isSharing && member.location ? (
            <View style={styles.infoItem}>
              <MapPin size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {member.location.latitude.toFixed(6)}, {member.location.longitude.toFixed(6)}
                </Text>
                {member.lastSeen && (
                  <Text style={styles.lastSeen}>
                    {isOnline
                      ? 'Online now'
                      : `Last seen ${formatDistanceToNow(new Date(member.lastSeen))} ago`}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.infoItem}>
              <MapPin size={20} color={Colors.light.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>Location sharing disabled</Text>
              </View>
            </View>
          )}

          {member.batteryLevel !== undefined ? (
            <View style={styles.infoItem}>
              <BatteryMedium size={20} color={getBatteryColor()} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Battery</Text>
                <Text style={[styles.infoValue, { color: getBatteryColor() }]}>
                  {member.batteryLevel}%
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 20,
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
  editButton: {
    padding: 8,
  },
  editText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  adminText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 4,
  },
});
