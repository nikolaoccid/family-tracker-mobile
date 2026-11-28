import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useFamily } from '@/features/family';
import { errorMessage } from '@/shared/api';
import { QueryBoundary } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { Colors } from '@/shared/ui/theme';
import { confirm } from '@/shared/utils/confirm';
import { ZoneForm } from '../components/ZoneForm';
import { ZoneScreenFrame } from '../components/ZoneScreenFrame';
import { useZoneForm } from '../hooks/useZoneForm';
import { useZoneMutations, useZones } from '../hooks/useZones';
import { formFromZone, toNewZone } from '../model/zoneForm';
import type { SafeZone } from '../model/zone';

export function EditZoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const family = useFamily().data;
  const zones = useZones(family?.id);

  return (
    <QueryBoundary query={zones}>
      {(list) => {
        const zone = list.find((z) => z.id === id);
        if (!zone) {
          router.navigate('/zones');
          return null;
        }
        return <EditZoneForm zone={zone} familyId={family?.id ?? ''} members={family?.members ?? []} />;
      }}
    </QueryBoundary>
  );
}

function EditZoneForm({
  zone,
  familyId,
  members,
}: {
  zone: SafeZone;
  familyId: string;
  members: React.ComponentProps<typeof ZoneForm>['members'];
}) {
  const router = useRouter();
  const { update, remove } = useZoneMutations(familyId);
  // Seeded once from the cached zone; later refetches must not overwrite the user's edits.
  const form = useZoneForm(formFromZone(zone));
  const save = async () => {
    if (!form.validate()) return;
    try {
      await update.mutateAsync({ zoneId: zone.id, changes: toNewZone(form.values) });
      router.back();
    } catch {
      // shown below through `update.error`
    }
  };

  const destroy = async () => {
    const ok = await confirm({
      title: 'Delete Safe Zone',
      message: 'Are you sure you want to delete this safe zone? This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await remove.mutateAsync(zone.id);
    router.back();
  };

  const error = update.error ?? remove.error;
  return (
    <ZoneScreenFrame
      title="Edit Safe Zone"
      headerRight={
        <TouchableOpacity onPress={() => void destroy()} style={styles.delete} accessibilityLabel="Delete zone">
          <Trash2 size={24} color={Colors.danger} />
        </TouchableOpacity>
      }
    >
      <ZoneForm
        values={form.values}
        errors={form.errors}
        members={members}
        onChange={form.change}
        showStatus
        mapHint="Tap or drag the pin to adjust the center"
      />
      {error ? <Text style={styles.error}>{errorMessage(error)}</Text> : null}
      <Button title="Save Changes" onPress={() => void save()} loading={update.isPending} fullWidth />
      <Button title="Cancel" onPress={() => router.back()} variant="outline" fullWidth style={styles.cancel} />
    </ZoneScreenFrame>
  );
}

const styles = StyleSheet.create({
  delete: { padding: 8 },
  error: { color: Colors.danger, marginBottom: 12 },
  cancel: { marginTop: 12 },
});
