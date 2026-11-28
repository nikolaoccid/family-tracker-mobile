import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  scrollContent: commonStyles.scrollContent,
  header: {
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
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
