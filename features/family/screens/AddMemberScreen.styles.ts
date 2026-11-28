import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';

export const styles = StyleSheet.create({
  container: screenStyles.container,
  subtitle: screenStyles.subtitle,
  formContainer: {
    flex: 1,
  },
  sendButton: {
    marginTop: 8,
  },
  successContainer: screenStyles.successContainer,
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  successMessage: screenStyles.successMessage,
  doneButton: {
    marginTop: 8,
  },
});
