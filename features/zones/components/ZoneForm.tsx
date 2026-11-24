import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { MemberSelector, type FamilyMember } from '@/features/family';
import Colors from '@/shared/ui/colors';
import ColorPicker from '@/shared/ui/ColorPicker';
import Input from '@/shared/ui/Input';
import EditableMap from '@/shared/ui/map/EditableMap';
import { RADIUS_MIN_M, toggleMember, type ZoneFormErrors, type ZoneFormValues } from '../model/zoneForm';

const PALETTE = [Colors.primary, Colors.secondary, Colors.success, Colors.danger, Colors.warning, Colors.info];

interface Props {
  values: ZoneFormValues;
  errors: ZoneFormErrors;
  members: readonly FamilyMember[];
  onChange: (changes: Partial<ZoneFormValues>) => void;
  /** Edit mode shows the active toggle. */
  showStatus?: boolean;
  mapHint: string;
}

/** Fields shared by the create and edit zone screens. */
export function ZoneForm({ values, errors, members, onChange, showStatus = false, mapHint }: Props) {
  const parsedRadius = Number.parseInt(values.radius, 10);
  const mapRadius = parsedRadius > 0 ? parsedRadius : RADIUS_MIN_M;

  return (
    <>
      <Input
        label="Zone Name"
        placeholder="Enter zone name (e.g. Home, School)"
        value={values.name}
        onChangeText={(name) => onChange({ name })}
        leftIcon={<MapPin size={20} color={Colors.light.icon} />}
        error={errors.name}
      />

      <Text style={styles.sectionTitle}>Zone Color</Text>
      <ColorPicker selectedColor={values.color} onSelectColor={(color) => onChange({ color })} colors={PALETTE} />

      <Text style={styles.sectionTitle}>Zone Location</Text>
      <EditableMap
        center={values.center}
        setCenter={(center) => onChange({ center })}
        radius={mapRadius}
        setRadius={(r) => onChange({ radius: String(r) })}
        color={values.color}
      />
      <Text style={styles.helper}>{mapHint}</Text>

      <Input
        label="Radius (meters)"
        placeholder="Enter radius in meters"
        value={values.radius}
        onChangeText={(radius) => onChange({ radius })}
        keyboardType="number-pad"
        error={errors.radius}
      />

      {showStatus && (
        <View style={styles.status}>
          <Text style={styles.statusLabel}>Zone Status</Text>
          <TouchableOpacity
            style={[styles.statusButton, values.isActive ? styles.active : styles.inactive]}
            onPress={() => onChange({ isActive: !values.isActive })}
            accessibilityRole="switch"
            accessibilityState={{ checked: values.isActive }}
          >
            <Text style={styles.statusText}>{values.isActive ? 'Active' : 'Inactive'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Family Members to Track</Text>
      {members.length > 0 ? (
        <MemberSelector
          members={[...members]}
          selectedMemberIds={values.members}
          onSelectMember={(id) => onChange({ members: toggleMember(values.members, id) })}
        />
      ) : (
        <Text style={styles.empty}>No family members available to track</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginTop: 16, marginBottom: 8 },
  helper: { fontSize: 12, color: Colors.light.subtext, marginTop: 8, marginBottom: 16 },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: Colors.light.text },
  statusButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  active: { backgroundColor: Colors.success },
  inactive: { backgroundColor: Colors.light.icon },
  statusText: { color: '#fff', fontWeight: '600' },
  empty: { fontSize: 14, color: Colors.light.subtext, marginVertical: 8 },
});
