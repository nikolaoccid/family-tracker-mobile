import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import type { FamilyMember } from '@/features/family';
import { Colors } from '@/shared/ui/theme';
import { SwitchRow } from '@/shared/ui/SwitchRow';
import { setMemberVisible, setSharingEnabled, setVisibility } from '../model/privacyEdits';
import type { PrivacySettings } from '../model/privacy';
import { SectionHeader } from './SectionHeader';

const OPTIONS = [
  { id: 'all', label: 'All family members' },
  { id: 'selected', label: 'Selected members only' },
  { id: 'none', label: 'Nobody' },
] as const;

interface Props {
  settings: PrivacySettings;
  members: readonly FamilyMember[];
  onChange: (next: PrivacySettings) => void;
}

export function VisibilitySection({ settings, members, onChange }: Props) {
  const sharing = settings.locationSharing;
  return (
    <View style={styles.section}>
      <SectionHeader Icon={Lock} title="Location Sharing" />
      <SwitchRow
        label="Share My Location"
        value={sharing.enabled}
        onValueChange={(v) => onChange(setSharingEnabled(settings, v))}
      />
      {sharing.enabled && (
        <>
          <Text style={styles.groupLabel}>Who can see my location?</Text>
          {OPTIONS.map(({ id, label }) => (
            <TouchableOpacity
              key={id}
              style={[styles.option, sharing.visibleTo === id && styles.optionSelected]}
              onPress={() => onChange(setVisibility(settings, id))}
              accessibilityRole="radio"
              accessibilityState={{ selected: sharing.visibleTo === id }}
            >
              <View style={styles.radio}>{sharing.visibleTo === id && <View style={styles.radioDot} />}</View>
              <Text style={styles.optionText}>{label}</Text>
            </TouchableOpacity>
          ))}
          {sharing.visibleTo === 'selected' && (
            <View style={styles.members}>
              <Text style={styles.membersTitle}>Select Members</Text>
              {members.map((member) => (
                <SwitchRow
                  key={member.id}
                  label={member.name}
                  value={sharing.selectedMembers.includes(member.id)}
                  onValueChange={(v) => onChange(setMemberVisible(settings, member.id, v))}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 24 },
  groupLabel: { fontSize: 14, color: Colors.light.subtext, marginTop: 8, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  optionSelected: { backgroundColor: `${Colors.primary}15` },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionText: { fontSize: 16, color: Colors.light.text },
  members: { marginTop: 8 },
  membersTitle: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
});
