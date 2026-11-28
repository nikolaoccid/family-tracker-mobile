import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Phone, Calendar, Crown, MapPin, BatteryMedium } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { batteryColor, isOnline } from '@/features/family';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { formatDate, formatDistanceToNow } from '@/shared/utils/date';
import { InfoRow } from '../components/InfoRow';
import { styles } from './MemberProfileScreen.styles';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

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

  const online = isOnline(member);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScreenHeader title="Profile" onBack={() => router.back()} right={isCurrentUser && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar
            source={member.avatar}
            name={member.name}
            size={100}
            showBadge={online}
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
          <InfoRow icon={<Mail size={20} color={Colors.primary} />} label="Email" value={member.email} />
          {member.phone ? <InfoRow icon={<Phone size={20} color={Colors.primary} />} label="Phone" value={member.phone} /> : null}
          <InfoRow
            icon={<Calendar size={20} color={Colors.primary} />}
            label="Member Since"
            value={formatDate(new Date(member.createdAt))}
          />
          {member.isSharing && member.location ? (
            <InfoRow
              icon={<MapPin size={20} color={Colors.primary} />}
              label="Location"
              value={`${member.location.latitude.toFixed(6)}, ${member.location.longitude.toFixed(6)}`}
            >
              {member.lastSeen && (
                <Text style={styles.lastSeen}>
                  {online ? 'Online now' : `Last seen ${formatDistanceToNow(new Date(member.lastSeen))} ago`}
                </Text>
              )}
            </InfoRow>
          ) : (
            <InfoRow icon={<MapPin size={20} color={Colors.light.icon} />} label="Location" value="Location sharing disabled" />
          )}
          {member.batteryLevel !== undefined ? (
            <InfoRow
              icon={<BatteryMedium size={20} color={batteryColor(member.batteryLevel)} />}
              label="Battery"
              value={`${member.batteryLevel}%`}
              valueStyle={{ color: batteryColor(member.batteryLevel) }}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

