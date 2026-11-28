import React from 'react';
import { Mail } from 'lucide-react-native';
import { Colors } from './theme';
import { Input } from './Input';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

export function EmailInput({ value, onChangeText, error }: Props) {
  return (
    <Input
      label="Email"
      placeholder="Enter your email"
      value={value}
      onChangeText={onChangeText}
      keyboardType="email-address"
      autoCapitalize="none"
      leftIcon={<Mail size={20} color={Colors.light.icon} />}
      error={error}
    />
  );
}
