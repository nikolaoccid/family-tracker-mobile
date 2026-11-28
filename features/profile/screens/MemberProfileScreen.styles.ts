import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoSection: commonStyles.infoSection,
  lastSeen: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 4,
  },
});
