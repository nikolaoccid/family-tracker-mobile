import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { errorMessage } from '@/shared/api';
import { ErrorState, LoadingState } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';
import { NotificationsSection } from '../components/NotificationsSection';
import { SchedulesSection } from '../components/SchedulesSection';
import { VisibilitySection } from '../components/VisibilitySection';
import { usePrivacySettings, useUpdatePrivacySettings } from '../hooks/usePrivacySettings';
import type { PrivacySettings } from '../model/privacy';

export function PrivacySettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const members = (useFamily().data?.members ?? []).filter((m) => m.id !== user?.id);
  const query = usePrivacySettings();
  const save = useUpdatePrivacySettings();
  const [edited, setDraft] = useState<PrivacySettings | null>(null);
  // The draft starts from the server value; later refetches do not overwrite unsaved edits.
  const draft = edited ?? query.data ?? null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
        <View style={styles.spacer} />
      </View>

      {query.isError ? (
        <ErrorState title="Failed to load privacy settings" error={query.error} onRetry={() => void query.refetch()} />
      ) : !draft ? (
        <LoadingState />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <VisibilitySection settings={draft} members={members} onChange={setDraft} />
          {user?.isPremium && <SchedulesSection settings={draft} onChange={setDraft} />}
          <NotificationsSection settings={draft} onChange={setDraft} />
          {save.error ? <Text style={styles.error}>{errorMessage(save.error)}</Text> : null}
          <Button title={save.isPending ? 'Saving...' : 'Save Settings'} onPress={() => save.mutate(draft)} disabled={save.isPending} fullWidth />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  back: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  spacer: { width: 40 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  error: { color: Colors.danger, marginBottom: 12 },
});
