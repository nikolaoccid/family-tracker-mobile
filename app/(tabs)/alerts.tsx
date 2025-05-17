import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import AlertItem from '@/components/AlertItem';

export default function AlertsScreen() {
  const { alerts, markAlertAsRead } = useFamilyStore();
  
  const unreadCount = alerts.filter(alert => !alert.read).length;

  const handleAlertPress = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      
      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertItem
              alert={item}
              onPress={() => handleAlertPress(item.id)}
              onMarkAsRead={() => handleMarkAsRead(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bell size={64} color={Colors.light.icon} />
          <Text style={styles.emptyTitle}>No Alerts</Text>
          <Text style={styles.emptyText}>
            You don't have any alerts yet. Alerts will appear here when family members trigger them.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  countBadge: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});