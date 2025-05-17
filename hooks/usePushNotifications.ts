import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from '@/api';
import { useAuthStore } from '@/store/authStore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { user } = useAuthStore();
  
  // Register for push notifications
  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }
    
    try {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      
      // Register with server if user is logged in
      if (user?.id) {
        await registerPushToken(token);
      }
      
      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };
  
  // Send a local notification
  const sendLocalNotification = async (title: string, body: string, data = {}) => {
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Send immediately
    });
  };
  
  // Set up notification listeners
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    // Register for push notifications
    registerForPushNotifications();
    
    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
    
    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification response (e.g., navigate to a specific screen)
    });
    
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user?.id]);
  
  return {
    expoPushToken,
    notification,
    registerForPushNotifications,
    sendLocalNotification,
  };
};