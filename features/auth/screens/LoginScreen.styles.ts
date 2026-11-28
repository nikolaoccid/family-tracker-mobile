import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  scrollContent: commonStyles.scrollContent,
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: screenStyles.titleAlt,
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 24,
  },
  errorContainer: screenStyles.errorContainer,
  errorText: screenStyles.errorText,
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  orText: {
    color: Colors.light.subtext,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.light.subtext,
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
