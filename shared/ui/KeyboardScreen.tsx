import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Props {
  style: StyleProp<ViewStyle>;
  /** iOS keyboard offset; Android keeps the fixed 20 used by the other screens. */
  iosOffset?: number;
  androidOffset?: number;
  children: React.ReactNode;
}

export function KeyboardScreen({ style, iosOffset = 0, androidOffset = 20, children }: Props) {
  return (
    <KeyboardAvoidingView
      style={style}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? iosOffset : androidOffset}
    >
      <StatusBar style="dark" />
      {children}
    </KeyboardAvoidingView>
  );
}
