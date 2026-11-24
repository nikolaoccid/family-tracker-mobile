import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeZone } from '@/types';
import Colors from '@/constants/colors';
import { MapPin, Users } from 'lucide-react-native';

interface SafeZoneItemProps {
  zone: SafeZone;
  onPress?: () => void;
  memberCount?: number;
}

export default function SafeZoneItem({ zone, onPress, memberCount = 0 }: SafeZoneItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: zone.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${zone.color}20` }]}>
        <MapPin size={24} color={zone.color} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{zone.name}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.radius}>{zone.radius}m radius</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: zone.isActive ? Colors.success : Colors.light.icon }
              ]}
            />
            <Text style={styles.status}>
              {zone.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.membersContainer}>
        <Users size={16} color={Colors.light.subtext} />
        <Text style={styles.membersCount}>
          {zone?.membersToTrack?.length}
        </Text>
      </View>
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
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radius: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginRight: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  status: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersCount: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
});
