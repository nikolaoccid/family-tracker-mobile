import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from '@/shared/utils/date';
import type { Alert } from '../model/alert';
import Colors from '@/shared/ui/colors';
import { AlertCircle, Battery, MapPin, Home, LogOut } from 'lucide-react-native';

interface AlertItemProps {
  alert: Alert;
  onPress?: () => void;
  onMarkAsRead?: () => void;
}

export default function AlertItem({ alert, onPress, onMarkAsRead }: AlertItemProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'emergency':
        return <AlertCircle size={24} color={Colors.danger} />;
      case 'low_battery':
        return <Battery size={24} color={Colors.warning} />;
      case 'zone_entry':
        return <MapPin size={24} color={Colors.success} />;
      case 'zone_exit':
        return <LogOut size={24} color={Colors.warning} />;
      case 'heading_home':
        return <Home size={24} color={Colors.info} />;
      default:
        return <AlertCircle size={24} color={Colors.primary} />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !alert.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getAlertIcon()}</View>

      <View style={styles.content}>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(alert?.timestamp))}
        </Text>
      </View>

      {!alert.read && onMarkAsRead && (
        <TouchableOpacity
          style={styles.readButton}
          onPress={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
        >
          <View style={styles.readDot} />
        </TouchableOpacity>
      )}
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
  unread: {
    backgroundColor: `${Colors.primary}10`,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  readButton: {
    padding: 8,
  },
  readDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
