import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from './theme';
import { KeyboardScreen } from './KeyboardScreen';
import { ScreenHeader } from './ScreenHeader';

interface Props {
  title: string;
  headerRight?: React.ReactNode;
  /** Horizontal content padding; schedule forms lay out their own rows. */
  padded?: boolean;
  /** Wrap in a keyboard-avoiding view (text-heavy forms). */
  keyboardAware?: boolean;
  children: React.ReactNode;
}

/** Header, optional keyboard handling and scrolling shared by the zone and schedule form screens. */
export function FormFrame({ title, headerRight, padded = true, keyboardAware = true, children }: Props) {
  const router = useRouter();
  const body = (
    <>
      <ScreenHeader title={title} onBack={() => router.back()} right={headerRight} />
      <ScrollView contentContainerStyle={[styles.content, padded && styles.padded]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </>
  );
  if (keyboardAware) return <KeyboardScreen style={styles.container}>{body}</KeyboardScreen>;
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingBottom: 40 },
  padded: { paddingHorizontal: 24 },
});
