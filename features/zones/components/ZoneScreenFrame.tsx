import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';

interface Props {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

/** Header, keyboard handling and scrolling shared by the zone form screens. */
export function ZoneScreenFrame({ title, headerRight, children }: Props) {
  const router = useRouter();
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {headerRight ?? <View style={styles.spacer} />}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  back: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  spacer: { width: 40 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
});
