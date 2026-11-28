import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';

export const styles = StyleSheet.create({
  container: screenStyles.container,
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: screenStyles.titleAlt,
  subtitle: screenStyles.subtitle,
  formContainer: {
    flex: 1,
  },
  errorContainer: screenStyles.errorContainer,
  errorText: {
    color: Colors.danger,
    fontSize: 14,
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
  shareButton: {
    marginBottom: 16,
  },
  doneButton: {
    marginTop: 8,
  },
});
