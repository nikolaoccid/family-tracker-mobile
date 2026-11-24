import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';

interface Props {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function ScheduleFrame({ title, headerRight, children }: Props) {
  const router = useRouter();
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  back: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  spacer: { width: 40 },
  content: { paddingBottom: 40 },
});
