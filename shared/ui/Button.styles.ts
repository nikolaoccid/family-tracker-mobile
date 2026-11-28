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

const BUTTON_FONT_SIZE = 16;
const disabledText = { color: Colors.light.subtext, fontSize: BUTTON_FONT_SIZE };

/** Solid background with readable text; every filled variant disables to the same grey. */
const filled = (backgroundColor: string, textColor: string) => ({
  container: { backgroundColor },
  text: { color: textColor, fontSize: BUTTON_FONT_SIZE },
  disabled: { backgroundColor: Colors.light.border },
  disabledText,
  loading: textColor,
});

/** Transparent button whose text and spinner use the accent color. */
const bare = (container: object, disabled: object) => ({
  container: { backgroundColor: 'transparent', ...container },
  text: { color: Colors.primary, fontSize: BUTTON_FONT_SIZE },
  disabled: { backgroundColor: 'transparent', ...disabled },
  disabledText,
  loading: Colors.primary,
});

export const variantStyles = {
  primary: filled(Colors.primary, Colors.white),
  secondary: filled(Colors.secondary, Colors.light.text),
  danger: filled(Colors.danger, Colors.white),
  success: filled(Colors.success, Colors.white),
  outline: bare({ borderWidth: 1, borderColor: Colors.primary }, { borderWidth: 1, borderColor: Colors.light.border }),
  text: bare({ paddingHorizontal: 0, paddingVertical: 0, minHeight: 0 }, {}),
};
