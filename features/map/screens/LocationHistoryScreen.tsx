import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { useLocationHistory } from '@/features/location';
import { ErrorState, LoadingState } from '@/shared/ui';
import Colors from '@/shared/ui/colors';
import Map from '@/shared/ui/map/Map';
import MemberPicker from '@/shared/ui/MemberPicker';
import PeriodPicker from '@/shared/ui/PeriodPicker';
import { rangeFor, type Period } from '@/shared/utils/period';
import { RecentLocations } from '../components/RecentLocations';

export function LocationHistoryScreen() {
  const router = useRouter();
  const { userId: userIdParam } = useLocalSearchParams<{ userId?: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const members = useFamily().data?.members ?? [];

  const [memberId, setMemberId] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<Period>('week');

  const requested = members.find((m) => m.id === userIdParam)?.id;
  const selectedId = memberId ?? requested ?? currentUser?.id;
  const range = rangeFor(period);
  const history = useLocationHistory(selectedId, range);
  const points = history.data ?? [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Location History</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MemberPicker members={members} selectedId={selectedId} onSelect={setMemberId} />
        <PeriodPicker period={period} startDate={range.startDate} endDate={range.endDate} onChange={setPeriod} />

        <View style={styles.mapContainer}>
          {history.isLoading ? (
            <LoadingState />
          ) : history.isError ? (
            <ErrorState error={history.error} onRetry={() => void history.refetch()} />
          ) : points.length > 0 ? (
            <Map familyLocations={points} />
          ) : (
            <View style={styles.empty}>
              <MapPin size={40} color={Colors.light.subtext} />
              <Text style={styles.emptyTitle}>No Location Data</Text>
              <Text style={styles.emptyText}>No location history found for this time period.</Text>
            </View>
          )}
        </View>

        <RecentLocations points={points} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  back: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  spacer: { width: 40 },
  content: { paddingBottom: 40 },
  mapContainer: { height: 300, marginHorizontal: 24, marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.card, padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center' },
});
