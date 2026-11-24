import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ArrowRight, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/store/authStore';

export default function NotificationsPermissionScreen() {
  const router = useRouter();
  const { registerForPushNotifications } = usePushNotifications();
  const { updateUser } = useAuthStore();
  
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support push notifications in the same way
        setPermissionStatus('granted');
        updateUser({ hasNotificationsEnabled: true });
        setTimeout(() => {
          router.push('/permissions/location');
        }, 1000);
        return;
      }
      
      const token = await registerForPushNotifications();
      
      if (token) {
        setPermissionStatus('granted');
        updateUser({ hasNotificationsEnabled: true });
        
        // Navigate to location permission screen after a short delay
        setTimeout(() => {
          router.push('/permissions/location');
        }, 1000);
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    updateUser({ hasNotificationsEnabled: false });
    router.push('/permissions/location');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Stay Updated</Text>
        
        <Text style={styles.description}>
          Enable notifications to receive real-time alerts about your family's location, 
          emergency situations, and when someone enters or leaves a safe zone.
        </Text>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Emergency alerts from family members</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Safe zone entry and exit notifications</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Low battery warnings for family devices</Text>
          </View>
        </View>
        
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1470&auto=format&fit=crop' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.footer}>
        {permissionStatus === 'granted' ? (
          <View style={styles.successContainer}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={styles.successText}>Notifications enabled!</Text>
          </View>
        ) : permissionStatus === 'denied' ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Notifications were not enabled. You can enable them later in your device settings.
            </Text>
          </View>
        ) : null}
        
        <Button
          title={permissionStatus === 'granted' ? "Continue" : "Enable Notifications"}
          onPress={handleRequestPermission}
          loading={isLoading}
          fullWidth
          icon={permissionStatus !== 'granted' ? <Bell size={20} color="#FFFFFF" /> : null}
        />
        
        {permissionStatus !== 'granted' && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip for now</Text>
            <ArrowRight size={16} color={Colors.light.subtext} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: `${Colors.success}10`,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: `${Colors.danger}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginRight: 8,
  },
});