import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlusCircle, MapPin } from 'lucide-react-native';
import { useFamily } from '@/features/family';
import { QueryBoundary } from '@/shared/ui';
import Button from '@/shared/ui/Button';
import Colors from '@/shared/ui/colors';
import SafeZoneItem from '../components/SafeZoneItem';
import { useZones } from '../hooks/useZones';

export function ZonesScreen() {
  const router = useRouter();
  const family = useFamily().data;
  const zones = useZones(family?.id);
  const createZone = () => router.push('/zones/create');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Safe Zones</Text>
        <TouchableOpacity style={styles.addButton} onPress={createZone} accessibilityLabel="Add safe zone">
          <PlusCircle size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <QueryBoundary query={zones}>
        {(list) =>
          list.length > 0 ? (
            <FlatList
              data={list}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SafeZoneItem
                  zone={item}
                  onPress={() => router.push({ pathname: '/zones/edit', params: { id: item.id } })}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Text style={styles.subtitle}>
                  Safe zones alert you when family members enter or leave important locations.
                </Text>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MapPin size={64} color={Colors.light.icon} />
              <Text style={styles.emptyTitle}>No Safe Zones</Text>
              <Text style={styles.emptyText}>
                Create safe zones to get alerts when family members enter or leave important locations.
              </Text>
              <Button title="Create Safe Zone" onPress={createZone} style={styles.createButton} />
            </View>
          )
        }
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  addButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
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
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
  },
});
