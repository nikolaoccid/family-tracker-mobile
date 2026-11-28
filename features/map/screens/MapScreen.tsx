import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Users } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { useFamilyLocations, useForegroundTracking, useLocationStore } from '@/features/location';
import { useZones, zonesContaining } from '@/features/zones';
import { QueryBoundary } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';
import { Map } from '@/shared/ui/map/Map';
import { SafetyActions } from '../components/SafetyActions';
import { StatusPanel } from '../components/StatusPanel';
import { useBatteryReporter } from '../hooks/useBatteryReporter';
import { useSafetyAlerts } from '../hooks/useSafetyAlerts';

export function MapScreen() {
  const familyQuery = useFamily();
  return (
    <QueryBoundary query={familyQuery}>
      {(family) => (family ? <FamilyMap familyId={family.id} /> : <NoFamily />)}
    </QueryBoundary>
  );
}

function NoFamily() {
  const router = useRouter();
  return (
    <View style={styles.noFamily}>
      <StatusBar style="dark" />
      <Users size={64} color={Colors.light.icon} />
      <Text style={styles.noFamilyTitle}>No Family Group</Text>
      <Text style={styles.noFamilyText}>
        You need to create or join a family group to start tracking your loved ones.
      </Text>
      <Button title="Create Family Group" onPress={() => router.push('/family/create')} style={styles.create} />
      <TouchableOpacity onPress={() => router.push('/family')}>
        <Text style={styles.join}>Or join an existing family</Text>
      </TouchableOpacity>
    </View>
  );
}

function FamilyMap({ familyId }: { familyId: string }) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const myLocation = useLocationStore((s) => s.myLocation);
  const tracking = useForegroundTracking(userId, familyId);
  const locations = useFamilyLocations(familyId).data ?? [];
  const zones = useZones(familyId).data ?? [];
  const battery = useBatteryReporter();
  const sendAlert = useSafetyAlerts(familyId);
  const insideZones = myLocation ? zonesContaining(myLocation, zones).map((z) => z.name) : [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map familyLocations={locations} safeZones={zones} />
      <SafetyActions
        onEmergency={() => void sendAlert('emergency')}
        onHeadingHome={() => void sendAlert('heading_home')}
      />
      <StatusPanel batteryPercent={battery} sharingActive={tracking.backgroundActive} insideZones={insideZones} />
      <View style={styles.footer}>
        <Button title="View Safe Zones" onPress={() => router.push('/zones')} variant="outline" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  noFamily: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noFamilyTitle: { fontSize: 20, fontWeight: '700', color: Colors.light.text, marginTop: 16, marginBottom: 8 },
  noFamilyText: { fontSize: 16, color: Colors.light.subtext, textAlign: 'center', marginBottom: 24 },
  create: { marginTop: 8, marginBottom: 16 },
  join: { fontSize: 14, color: Colors.primary, textDecorationLine: 'underline' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
