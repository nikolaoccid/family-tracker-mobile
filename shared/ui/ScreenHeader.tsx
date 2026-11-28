import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from './theme';
import { screenStyles } from './screenStyles';

interface Props {
  title: string;
  onBack: () => void;
  /** Right-hand action; an empty spacer keeps the title centered when omitted. */
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View style={screenStyles.header}>
      <TouchableOpacity style={styles.back} onPress={onBack} accessibilityLabel="Go back">
        <ArrowLeft size={24} color={Colors.light.text} />
      </TouchableOpacity>
      <Text style={screenStyles.title}>{title}</Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { padding: 8 },
  spacer: { width: 40 },
});
