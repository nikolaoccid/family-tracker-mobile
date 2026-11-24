import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import Colors from './colors';

interface Props {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function SwitchRow({ label, value, onValueChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
        thumbColor={value ? Colors.primary : Colors.light.icon}
        ios_backgroundColor={Colors.light.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  label: { fontSize: 16, color: Colors.light.text, flex: 1, marginRight: 12 },
});
