import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail, Phone, Calendar, Crown, MapPin, BatteryMedium } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import { formatDate, formatDistanceToNow } from '@/shared/utils/date';
import { styles } from './MemberProfileScreen.styles';

export function MemberProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const familyQuery = useFamily();
  const member = familyQuery.data?.members.find((m) => m.id === id) ?? null;
  const loading = familyQuery.isPending;

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

