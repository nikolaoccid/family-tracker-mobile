import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
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
  resetButton: {
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  successTitle: commonStyles.successTitle,
  successMessage: screenStyles.successMessage,
  backToLoginButton: {
    marginTop: 8,
  },
});
