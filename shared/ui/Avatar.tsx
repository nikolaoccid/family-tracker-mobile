import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/shared/ui/theme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

export function Avatar({
  source,
  name,
  size = 40,
  style,
  showBadge = false,
  badgeColor = Colors.success,
}: AvatarProps) {
  const getInitials = () => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const fontSize = size * 0.4;
  const badgeSize = size * 0.3;

  return (
    <View style={[style, { width: size, height: size }]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View 
          style={[
            styles.placeholder,
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: Colors.primary 
            }
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials()}
          </Text>
        </View>
      )}
      
      {showBadge && (
        <View 
          style={[
            styles.badge,
            { 
              width: badgeSize, 
              height: badgeSize, 
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              right: 0,
              bottom: 0,
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.light.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});