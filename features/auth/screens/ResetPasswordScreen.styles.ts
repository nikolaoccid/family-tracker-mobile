import { StyleSheet } from 'react-native';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: screenStyles.subtitle,
  formContainer: {
    flex: 1,
  },
  errorContainer: screenStyles.errorContainer,
  errorText: screenStyles.errorText,
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
