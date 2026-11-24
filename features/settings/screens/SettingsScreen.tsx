import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clock, CreditCard, Lock, LogOut, Trash2, User } from 'lucide-react-native';
import { useAuthStore, useDeleteAccount } from '@/features/auth';
import { config } from '@/shared/api';
import Colors from '@/shared/ui/colors';
import MenuItem from '@/shared/ui/MenuItem';
import { ProfileCard } from '../components/ProfileCard';

export function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const { deleteAccount } = useDeleteAccount(() => router.replace('/(auth)'));
  const openProfile = () => user && router.push(`/profile/view/${user.id}`);
  const logout = () => {
    signOut();
    router.replace('/(auth)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {user ? <ProfileCard user={user} onPress={openProfile} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem label="Personal Information" Icon={User} onPress={openProfile} />
          <MenuItem label="Subscription" Icon={CreditCard} onPress={() => router.push('/subscription')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Location</Text>
          <MenuItem label="Privacy Settings" Icon={Lock} onPress={() => router.push('/settings/privacy')} />
          {user?.isPremium && (
            <MenuItem label="Sharing Schedules" Icon={Clock} onPress={() => router.push('/schedule/create')} />
          )}
        </View>

        <View style={styles.section}>
          <MenuItem label="Log Out" Icon={LogOut} variant="danger" onPress={logout} />
          <MenuItem label="Delete Account" Icon={Trash2} variant="danger" onPress={() => void deleteAccount()} />
        </View>

        <Text style={styles.version}>Version {config.appVersion}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12, paddingLeft: 8 },
  version: { fontSize: 12, color: Colors.light.subtext, textAlign: 'center', marginTop: 16 },
});
