import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';

export const styles = StyleSheet.create({
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

export const sizeStyles = {
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

export const variantStyles = {
  primary: {
    container: {
      backgroundColor: Colors.primary,
    },
    text: {
      color: Colors.white,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.white,
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
      color: Colors.white,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.white,
  },
  success: {
    container: {
      backgroundColor: Colors.success,
    },
    text: {
      color: Colors.white,
      fontSize: 16,
    },
    disabled: {
      backgroundColor: Colors.light.border,
    },
    disabledText: {
      color: Colors.light.subtext,
      fontSize: 16,
    },
    loading: Colors.white,
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
