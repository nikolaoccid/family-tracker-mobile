import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  scrollContent: commonStyles.scrollContent,
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: screenStyles.titleAlt,
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  errorContainer: screenStyles.errorContainer,
  errorText: screenStyles.errorText,
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: Colors.light.subtext,
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    color: Colors.light.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
});
