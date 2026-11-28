import { StyleSheet } from 'react-native';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.container,
  header: screenStyles.headerAlt,
  backButton: {
    marginBottom: 16,
  },
  title: screenStyles.titleAlt,
  subtitle: screenStyles.subtitle,
  formContainer: {
    flex: 1,
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
