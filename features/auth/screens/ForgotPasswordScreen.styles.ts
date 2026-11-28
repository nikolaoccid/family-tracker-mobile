import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

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
  resetButton: {
    marginTop: 8,
  },
  successContainer: screenStyles.successContainer,
  successTitle: commonStyles.successTitle,
  successMessage: screenStyles.successMessage,
  backToLoginButton: {
    marginTop: 8,
  },
});
