import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { Avatar } from '@/shared/ui/Avatar';
import { Colors } from '@/shared/ui/theme';
import { commonStyles } from '../screens/common.styles';

interface Props {
  name: string;
  avatar?: string | null;
  isPremium?: boolean | null;
  isAdmin?: boolean;
  /** Shows the green presence dot; omit for the signed-in user. */
  online?: boolean;
}

const AVATAR_SIZE = 100;

export function ProfileHero({ name, avatar, isPremium, isAdmin, online }: Props) {
  return (
    <View style={commonStyles.profileHeader}>
      <Avatar source={avatar ?? undefined} name={name} size={AVATAR_SIZE} showBadge={online} badgeColor={Colors.success} />
      <Text style={commonStyles.name}>{name}</Text>
      {isAdmin ? (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>Family Admin</Text>
        </View>
      ) : null}
      {isPremium ? (
        <View style={commonStyles.premiumBadge}>
          <Crown size={14} color={Colors.light.text} />
          <Text style={commonStyles.premiumText}>Premium Member</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  adminText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});
