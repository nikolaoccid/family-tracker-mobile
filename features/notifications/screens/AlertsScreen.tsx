import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { useFamily } from '@/features/family';
import { QueryBoundary } from '@/shared/ui';
import { useAlerts } from '../hooks/useAlerts';
import { useReadAlertsStore } from '../model/readAlertsStore';
import { AlertItem } from '../components/AlertItem';

export function AlertsScreen() {
  const family = useFamily().data;
  const query = useAlerts(family?.id);
  const markRead = useReadAlertsStore((s) => s.markRead);
  const { alerts } = query;
  const unreadCount = alerts.filter((alert) => !alert.read).length;

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

      <QueryBoundary query={query}>
        {() => alerts.length > 0 ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertItem
              alert={item}
              onPress={() => markRead(item.id)}
              onMarkAsRead={() => markRead(item.id)}
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
      </QueryBoundary>
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
    color: Colors.white,
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
