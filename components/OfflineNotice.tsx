import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform, StatusBar } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { isApiAvailable } from '@/api/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastCheckTimeRef = useRef(0);
  
  const checkConnection = async () => {
    // Prevent multiple simultaneous checks and throttle checks
    const now = Date.now();
    if (!isMountedRef.current || isChecking || (now - lastCheckTimeRef.current < 5000)) return;
    
    lastCheckTimeRef.current = now;
    setIsChecking(true);
    
    try {
      const isAvailable = await isApiAvailable();
      
      if (isMountedRef.current) {
        // Only update state if component is still mounted
        if (isOffline !== !isAvailable) {
          setIsOffline(!isAvailable);
          
          // Animate in or out based on connection status
          Animated.timing(slideAnim, {
            toValue: !isAvailable ? 0 : -60,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }
    } catch (error) {
      console.error('Error checking API availability:', error);
      
      if (isMountedRef.current && !isOffline) {
        setIsOffline(true);
        
        // Animate in
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  };
  
  // Check connection on mount and periodically
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial check with a slight delay to prevent initial render issues
    const initialCheckTimeout = setTimeout(() => {
      checkConnection();
    }, 1000);
    
    // Set up interval for periodic checks
    checkIntervalRef.current = setInterval(() => {
      checkConnection();
    }, 30000); // Check every 30 seconds
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(initialCheckTimeout);
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);
  
  // If online, don't render anything
  if (!isOffline) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <WifiOff size={16} color="#FFFFFF" />
          <Text style={styles.text}>You're offline. Some features may be limited.</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={checkConnection}
          disabled={isChecking}
        >
          <RefreshCw size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.danger,
    zIndex: 1000,
  },
  safeArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
  },
});