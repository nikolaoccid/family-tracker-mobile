import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, BarChart2 } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { ErrorState, LoadingState } from '@/shared/ui';
import { MemberPicker } from '@/shared/ui/MemberPicker';
import { PeriodPicker } from '@/shared/ui/PeriodPicker';
import { rangeFor, type Period } from '@/shared/utils/period';
import { Colors } from '@/shared/ui/theme';
import { DailyBreakdown } from '../components/DailyBreakdown';
import { RecentVisits } from '../components/RecentVisits';
import { SummaryCard } from '../components/SummaryCard';
import { ZoneBreakdown } from '../components/ZoneBreakdown';
import { ZonePicker } from '../components/ZonePicker';
import { useAnalytics } from '../hooks/useAnalytics';
import { useZones } from '../hooks/useZones';
import { totalMinutes } from '../model/analytics';

export function ZoneAnalyticsScreen() {
  const router = useRouter();
  const { userId: userIdParam } = useLocalSearchParams<{ userId?: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const family = useFamily().data;
  const zones = useZones(family?.id).data ?? [];

  const [memberId, setMemberId] = useState<string | undefined>(undefined);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('week');

  const members = family?.members ?? [];
  const requested = members.find((m) => m.id === userIdParam)?.id;
  const selectedId = memberId ?? requested ?? currentUser?.id;
  const selectedName = members.find((m) => m.id === selectedId)?.name ?? currentUser?.name;
  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const range = rangeFor(period);
  const analytics = useAnalytics({ userId: selectedId, zoneId, ...range });

  const toggleZone = (zone: { id: string }) => setZoneId((current) => (current === zone.id ? null : zone.id));
  const first = analytics.data[0];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Zone Analytics</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MemberPicker members={members} selectedId={selectedId} onSelect={setMemberId} />
        <ZonePicker zones={zones} selectedId={zoneId} onToggle={toggleZone} />
        <PeriodPicker period={period} startDate={range.startDate} endDate={range.endDate} onChange={setPeriod} />

        <View style={styles.body}>
          {analytics.isLoading ? (
            <LoadingState />
          ) : analytics.error ? (
            <ErrorState error={analytics.error} onRetry={() => void analytics.refetch()} />
          ) : first ? (
            <>
              <SummaryCard
                title={selectedZone ? `Time in ${selectedZone.name}` : 'Total Time in All Zones'}
                minutes={totalMinutes(analytics.data)}
                caption={`${selectedName ?? 'Your'}'s total time spent`}
              />
              {!selectedZone && <ZoneBreakdown analytics={analytics.data} zones={zones} onSelectZone={toggleZone} />}
              <DailyBreakdown days={first.timeByDay} color={selectedZone?.color ?? Colors.primary} />
              {selectedZone && <RecentVisits visits={first.visits} />}
            </>
          ) : (
            <View style={styles.empty}>
              <BarChart2 size={40} color={Colors.light.subtext} />
              <Text style={styles.emptyTitle}>No Analytics Data</Text>
              <Text style={styles.emptyText}>
                {selectedZone
                  ? `No time spent in ${selectedZone.name} during this period.`
                  : 'No time spent in any zones during this period.'}
              </Text>
            </View>
          )}
        </View>
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
  body: { paddingHorizontal: 24 },
  empty: { height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.card, borderRadius: 16, padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center' },
});
