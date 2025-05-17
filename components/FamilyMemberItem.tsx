import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FamilyMember } from '@/types';
import Colors from '@/constants/colors';
import Avatar from './Avatar';
import { formatDistanceToNow } from '@/utils/date';
import { BatteryMedium, MapPin } from 'lucide-react-native';

interface FamilyMemberItemProps {
  member: FamilyMember;
  onPress?: () => void;
}

export default function FamilyMemberItem({ member, onPress }: FamilyMemberItemProps) {
  const getBatteryColor = () => {
    if (!member.batteryLevel) return Colors.light.icon;
    if (member.batteryLevel < 20) return Colors.danger;
    if (member.batteryLevel < 50) return Colors.warning;
    return Colors.success;
  };

  const isOnline = member.isSharing && member.lastSeen && 
    new Date().getTime() - new Date(member.lastSeen).getTime() < 5 * 60 * 1000; // 5 minutes

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar 
        source={member.avatar} 
        name={member.name} 
        size={50} 
        showBadge={!!isOnline}
        badgeColor={Colors.success}
      />
      
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.name}</Text>
          {member.role === 'admin' ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          ) : null}
        </View>
        
        {member.lastSeen ? (
          <Text style={styles.lastSeen}>
            {member.isSharing 
              ? isOnline 
                ? 'Online now' 
                : `Last seen ${formatDistanceToNow(new Date(member.lastSeen))} ago`
              : 'Location sharing disabled'}
          </Text>
        ) : null}
        
        {member.location && member.isSharing ? (
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.location}>
              {member.location.latitude.toFixed(6)}, {member.location.longitude.toFixed(6)}
            </Text>
          </View>
        ) : null}
      </View>
      
      {member.batteryLevel !== undefined ? (
        <View style={styles.batteryContainer}>
          <BatteryMedium size={16} color={getBatteryColor()} />
          <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
            {member.batteryLevel}%
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    marginBottom: 12,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 4,
  },
});