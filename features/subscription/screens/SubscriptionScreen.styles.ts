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
