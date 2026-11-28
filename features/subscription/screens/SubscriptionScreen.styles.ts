import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  backButton: {
    padding: 8,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  subtitle: screenStyles.subtitle,
  transactionErrorContainer: {
    backgroundColor: `${Colors.danger}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  transactionErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 8,
    marginBottom: 8,
  },
  transactionErrorText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
