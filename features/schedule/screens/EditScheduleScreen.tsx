import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { QueryBoundary } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';
import { confirm } from '@/shared/utils/confirm';
import { ScheduleForm } from '../components/ScheduleForm';
import { ScheduleFrame } from '../components/ScheduleFrame';
import { useSchedules } from '../hooks/useScheduleMutations';
import { draftFromSchedule, validateDraft, type ScheduleDraft, type ScheduleErrors } from '../model/schedule';

export function EditScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { query, schedules } = useSchedules();

  return (
    <QueryBoundary query={query}>
      {() => {
        const schedule = schedules.find((s) => s.id === id);
        if (!schedule) {
          router.back();
          return null;
        }
        return <EditForm id={schedule.id} initial={draftFromSchedule(schedule)} />;
      }}
    </QueryBoundary>
  );
}

function EditForm({ id, initial }: { id: string; initial: ScheduleDraft }) {
  const router = useRouter();
  const { save, remove, isSaving } = useSchedules();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<ScheduleErrors>({});

  const submit = async () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      await save(id, draft);
      router.back();
    } catch {
      setErrors({ name: 'Could not save the schedule. Please try again.' });
    }
  };

  const destroy = async () => {
    const ok = await confirm({
      title: 'Delete Schedule',
      message: 'Are you sure you want to delete this schedule?',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await remove(id);
    router.back();
  };

  return (
    <ScheduleFrame
      title="Edit Schedule"
      headerRight={
        <TouchableOpacity onPress={() => void destroy()} style={styles.delete} accessibilityLabel="Delete schedule">
          <Trash2 size={24} color={Colors.danger} />
        </TouchableOpacity>
      }
    >
      <ScheduleForm draft={draft} errors={errors} onChange={(c) => setDraft((d) => ({ ...d, ...c }))} />
      <Button title={isSaving ? 'Saving...' : 'Save Changes'} onPress={() => void submit()} disabled={isSaving} fullWidth style={styles.button} />
    </ScheduleFrame>
  );
}

const styles = StyleSheet.create({
  delete: { padding: 8 },
  button: { marginHorizontal: 24, marginTop: 8 },
});
