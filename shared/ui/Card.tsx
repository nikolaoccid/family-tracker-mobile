import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '@/shared/ui/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Card({
  children,
  title,
  subtitle,
  onPress,
  style,
  contentStyle,
}: CardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {(title || subtitle) ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  content: {
    padding: 16,
  },
});