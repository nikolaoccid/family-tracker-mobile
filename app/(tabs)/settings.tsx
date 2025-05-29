import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  BatteryMedium,
  MapPin
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import Avatar from '@/components/Avatar';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLocation } from '@/hooks/useLocation';
import {useFamilyStore} from "@/store/familyStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isBackgroundTrackingEnabled } = useLocationStore();
  const { registerForPushNotifications } = usePushNotifications();
  const { isBackgroundActive } = useLocation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [batteryAlertsEnabled, setBatteryAlertsEnabled] = useState(true);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value && Platform.OS !== 'web') {
      await registerForPushNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };

  const handleEditProfile = () => {
    router.push('/profile/view');
  };

  const handleSubscription = () => {
    router.push('/subscription');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <TouchableOpacity
            style={styles.profileCard}
            onPress={handleEditProfile}
          >
            <Avatar
              source={user.avatar}
              name={user.name}
              size={60}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              {user.isPremium ? (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              ) : null}
            </View>
            <ChevronRight size={20} color={Colors.light.icon} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditProfile}
          >
            <View style={styles.menuIconContainer}>
              <User size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Personal Information</Text>
            <ChevronRight size={20} color={Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSubscription}
          >
            <View style={styles.menuIconContainer}>
              <CreditCard size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Subscription</Text>
            <ChevronRight size={20} color={Colors.light.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.light.icon}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Location Services</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                isBackgroundActive ? styles.statusActive : styles.statusInactive
              ]} />
              <Text style={styles.statusText}>
                {isBackgroundActive ? 'Running' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <BatteryMedium size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Battery Alerts</Text>
            <Switch
              value={batteryAlertsEnabled}
              onValueChange={setBatteryAlertsEnabled}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={batteryAlertsEnabled ? Colors.primary : Colors.light.icon}
              ios_backgroundColor={Colors.light.border}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={20} color={Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.danger}20` }]}>
              <LogOut size={20} color={Colors.danger} />
            </View>
            <Text style={[styles.menuText, { color: Colors.danger }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  premiumBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  premiumText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: Colors.success,
  },
  statusInactive: {
    backgroundColor: Colors.danger,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 16,
  },
});
