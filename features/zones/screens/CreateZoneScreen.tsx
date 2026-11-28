import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { useFamily } from '@/features/family';
import { useCurrentPosition } from '@/features/location';
import { errorMessage } from '@/shared/api';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { ZoneForm } from '../components/ZoneForm';
import { FormFrame } from '@/shared/ui/FormFrame';
import { useZoneForm } from '../hooks/useZoneForm';
import { useZoneMutations } from '../hooks/useZones';
import { toNewZone } from '../model/zoneForm';

export function CreateZoneScreen() {
  const router = useRouter();
  const family = useFamily().data;
  const getPosition = useCurrentPosition();
  const { create } = useZoneMutations(family?.id ?? '');
  const form = useZoneForm();
  const { change } = form;

  useEffect(() => {
    void getPosition().then((p) => p && change({ center: { latitude: p.latitude, longitude: p.longitude } }));
  }, [getPosition, change]);

  if (!useAuthStore.getState().user) return <ErrorState title="Sign in to create a zone" />;

  const submit = async () => {
    if (!form.validate()) return;
    try {
      await create.mutateAsync(toNewZone(form.values));
      router.back();
    } catch {
      // shown below through `create.error`
    }
  };

  return (
    <FormFrame title="Create Safe Zone">
      <Text style={styles.subtitle}>
        Safe zones alert you when family members enter or leave important locations.
      </Text>
      <ZoneForm
        values={form.values}
        errors={form.errors}
        members={family?.members ?? []}
        onChange={form.change}
        mapHint="Tap or drag the pin to set the zone center"
      />
      {create.error ? <Text style={styles.error}>{errorMessage(create.error)}</Text> : null}
      <Button title="Create Safe Zone" onPress={() => void submit()} loading={create.isPending} fullWidth />
      <Button title="Cancel" onPress={() => router.back()} variant="outline" fullWidth style={styles.cancel} />
    </FormFrame>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: Colors.light.subtext, marginBottom: 24 },
  error: { color: Colors.danger, marginBottom: 12 },
  cancel: { marginTop: 12 },
});
