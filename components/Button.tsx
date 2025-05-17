import React from 'react';
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
      ...(fullWidth && styles.fullWidth),
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant].disabled,
      };
    }

    return {
      ...baseStyle,
      ...variantStyles[variant].container,
    };
  };

  const getTextStyle = () => {
    if (disabled) {
      return {
        ...styles.text,
        ...variantStyles[variant].disabledText,
      };
    }

    return {
      ...styles.text,
      ...variantStyles[variant].text,
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variantStyles[variant].loading} 
          size="small" 
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

const sizeStyles = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
};

const variantStyles = {
  primary: {
    container: {
      backgroundColor: Colors.primary,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: Colors.secondary,
    },
    text: {
      color: Colors.light.text,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.light.text,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    text: {
      color: Colors.primary,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.primary,
  },
  danger: {
    container: {
      backgroundColor: Colors.danger,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: '#FFFFFF',
  },
  success: {
    container: {
      backgroundColor: Colors.success,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: '#FFFFFF',
  },
  text: {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      minHeight: 0,
    },
    text: {
      color: Colors.primary,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: 'transparent',
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.primary,
  },
};