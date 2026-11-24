import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, ArrowRight, CheckCircle } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import Button from '@/shared/ui/Button';
import { usePushNotifications } from '@/features/notifications';
import { useUpdateProfile } from '@/features/auth';
import { logger } from '@/shared/logger';
import { styles } from './NotificationPermissionScreen.styles';

export function NotificationPermissionScreen() {
  const router = useRouter();
  const { registerForPushNotifications } = usePushNotifications();
  const { mutate: updateUser } = useUpdateProfile();
  
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
      logger.warn('notification permission request failed', error);
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
