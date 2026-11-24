import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import { formatDate } from '@/shared/utils/date';
import { PERIODS, type Period } from '@/shared/utils/period';

interface Props {
  period: Period;
  startDate: string;
  endDate: string;
  onChange: (period: Period) => void;
}

export default function PeriodPicker({ period, startDate, endDate, onChange }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Time Period</Text>
      <View style={styles.buttons}>
        {PERIODS.map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            style={[styles.button, period === id && styles.selected]}
            onPress={() => onChange(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: period === id }}
          >
            <Text style={[styles.text, period === id && styles.selectedText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.info}>
        <Calendar size={16} color={Colors.light.subtext} />
        <Text style={styles.infoText}>
          {formatDate(new Date(startDate))} - {formatDate(new Date(endDate))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
  buttons: { flexDirection: 'row', marginBottom: 12 },
  button: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: Colors.light.card, alignItems: 'center', marginRight: 8 },
  selected: { backgroundColor: Colors.primary },
  text: { fontSize: 14, fontWeight: '500', color: Colors.light.text },
  selectedText: { color: '#FFFFFF' },
  info: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, color: Colors.light.subtext, marginLeft: 8 },
});
