import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { commonStyles } from '../screens/common.styles';

export function SkipButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={commonStyles.skipButton} onPress={onPress}>
      <Text style={commonStyles.skipText}>Skip for now</Text>
      <ArrowRight size={16} color={Colors.light.subtext} />
    </TouchableOpacity>
  );
}
