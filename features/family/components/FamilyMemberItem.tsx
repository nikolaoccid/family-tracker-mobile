import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { FamilyMember } from '../model/family';
import { Colors } from '@/shared/ui/theme';
import { Avatar } from '@/shared/ui/Avatar';
import { formatDistanceToNow } from '@/shared/utils/date';
import { BatteryMedium, MapPin, Trash2, UserCog } from 'lucide-react-native';
import { styles } from './FamilyMemberItem.styles';
import { batteryColor, isOnline } from '../model/memberStatus';

interface FamilyMemberItemProps {
  member: FamilyMember;
  onPress?: () => void;
  isCurrentUser?: boolean;
  isAdmin?: boolean;
  onDelete?: () => void;
  onPromote?: () => void;
  onDemote?: () => void;
}

export function FamilyMemberItem({
                                           member,
                                           onPress,
                                           isCurrentUser = false,
                                           isAdmin = false,
                                           onDelete,
                                           onPromote,
                                           onDemote,
                                         }: FamilyMemberItemProps) {
  const online = isOnline(member);

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
        showBadge={online}
        badgeColor={Colors.success}
      />

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {member.name?.length > 23 ? `${member.name.substring(0, 23)}...` : member.name}
            {isCurrentUser ? ' (You)' : ''}
          </Text>
          {member.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        {member.lastSeen && (
          <Text style={styles.lastSeen}>
            {member.isSharing
              ? online
                ? 'Online now'
                : `Last seen ${formatDistanceToNow(new Date(member.lastSeen))} ago`
              : 'Location sharing disabled'}
          </Text>
        )}

        {member.location && member.isSharing && (
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.location}>
              {member.location.latitude.toFixed(6)}, {member.location.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rightContainer}>
        {member.batteryLevel !== undefined && (
          <View style={styles.batteryContainer}>
            <BatteryMedium size={16} color={batteryColor(member.batteryLevel)} />
            <Text style={[styles.batteryText, { color: batteryColor(member.batteryLevel) }]}>
              {member.batteryLevel}%
            </Text>
          </View>
        )}

        {isAdmin && !isCurrentUser && (
          <View style={styles.adminActions}>
            {onPromote && member.role === 'member' && (
              <TouchableOpacity style={styles.adminAction} onPress={onPromote}>
                <UserCog size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}

            {onDemote && member.role === 'admin' && (
              <TouchableOpacity style={styles.adminAction} onPress={onDemote}>
                <UserCog size={18} color={Colors.warning} />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity style={styles.adminAction} onPress={onDelete}>
                <Trash2 size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

