import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/shared/ui/Button';
import { ScheduleForm } from '../components/ScheduleForm';
import { FormFrame } from '@/shared/ui/FormFrame';
import { useSchedules } from '../hooks/useScheduleMutations';
import { emptyDraft, validateDraft, type ScheduleErrors } from '../model/schedule';

export function CreateScheduleScreen() {
  const router = useRouter();
  const { create, isSaving } = useSchedules();
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState<ScheduleErrors>({});

  const submit = async () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    try {
      await create(draft);
      router.back();
    } catch {
      setErrors({ name: 'Could not save the schedule. Please try again.' });
    }
  };

  return (
    <FormFrame padded={false} keyboardAware={false} title="Create Schedule">
      <ScheduleForm draft={draft} errors={errors} onChange={(c) => setDraft((d) => ({ ...d, ...c }))} />
      <Button title={isSaving ? 'Creating...' : 'Create Schedule'} onPress={() => void submit()} disabled={isSaving} fullWidth style={styles.button} />
    </FormFrame>
  );
}

const styles = StyleSheet.create({ button: { marginHorizontal: 24, marginTop: 8 } });
