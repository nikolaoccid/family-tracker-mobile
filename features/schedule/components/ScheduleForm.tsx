import React from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Input } from '@/shared/ui/Input';
import {
  WEEKDAYS,
  formatTimeInput,
  isWithinSchedule,
  toggleDay,
  type ScheduleDraft,
  type ScheduleErrors,
} from '../model/schedule';

interface Props {
  draft: ScheduleDraft;
  errors: ScheduleErrors;
  onChange: (changes: Partial<ScheduleDraft>) => void;
}

export function ScheduleForm({ draft, errors, onChange }: Props) {
  const activeNow = isWithinSchedule({ ...draft, id: 'draft' }, new Date());
  return (
    <View style={styles.section}>
      <Input
        label="Schedule Name"
        placeholder="e.g., Work Hours, School Days"
        value={draft.name}
        onChangeText={(name) => onChange({ name })}
        error={errors.name}
      />

      <Text style={styles.sectionTitle}>Days of Week</Text>
      {errors.days && <Text style={styles.error}>{errors.days}</Text>}
      <View style={styles.days}>
        {WEEKDAYS.map((day) => {
          const selected = draft.days.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.day, selected && styles.daySelected]}
              onPress={() => onChange({ days: toggleDay(draft.days, day) })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </Text>
              {selected && <Check size={14} color={Colors.white} style={styles.check} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Time Range</Text>
      {errors.time && <Text style={styles.error}>{errors.time}</Text>}
      <View style={styles.times}>
        <TimeField value={draft.startTime} placeholder="08:00" onChange={(startTime) => onChange({ startTime })} />
        <Text style={styles.to}>to</Text>
        <TimeField value={draft.endTime} placeholder="17:00" onChange={(endTime) => onChange({ endTime })} />
      </View>

      <View style={styles.enable}>
        <Text style={styles.enableText}>Enable Schedule</Text>
        <Switch
          value={draft.enabled}
          onValueChange={(enabled) => onChange({ enabled })}
          trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
          thumbColor={draft.enabled ? Colors.primary : Colors.light.icon}
          ios_backgroundColor={Colors.light.border}
        />
      </View>
      <Text style={styles.helper}>
        Your location will be shared automatically during the scheduled times on the selected days.
        {activeNow ? ' This schedule is active right now.' : ''}
      </Text>
    </View>
  );
}

function TimeField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.timeBox}>
      <Clock size={20} color={Colors.primary} style={styles.timeIcon} />
      <TextInput
        style={styles.timeInput}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => onChange(formatTimeInput(text))}
        keyboardType="numeric"
        accessibilityLabel={`Time ${placeholder}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginTop: 16, marginBottom: 12 },
  error: { fontSize: 12, color: Colors.danger, marginBottom: 8 },
  days: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  day: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  daySelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { fontSize: 14, color: Colors.light.text },
  dayTextSelected: { color: Colors.white },
  check: { marginLeft: 4 },
  times: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
  },
  timeIcon: { marginRight: 8 },
  timeInput: { flex: 1, fontSize: 16, color: Colors.light.text },
  to: { marginHorizontal: 12, fontSize: 16, color: Colors.light.subtext },
  enable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  enableText: { fontSize: 16, color: Colors.light.text },
  helper: { fontSize: 14, color: Colors.light.subtext, marginTop: 8 },
});
