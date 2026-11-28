import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { commonStyles } from '../screens/common.styles';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: StyleProp<TextStyle>;
  /** Extra lines under the value (for example last seen). */
  children?: React.ReactNode;
}

export function InfoRow({ icon, label, value, valueStyle, children }: Props) {
  return (
    <View style={commonStyles.infoItem}>
      {icon}
      <View style={styles.content}>
        <Text style={commonStyles.infoLabel}>{label}</Text>
        <Text style={[commonStyles.infoValue, valueStyle]}>{value}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { marginLeft: 16, flex: 1 },
});
