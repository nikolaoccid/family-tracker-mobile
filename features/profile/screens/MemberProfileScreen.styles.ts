import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
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
  header: screenStyles.header,
  backButton: {
    padding: 8,
  },
  title: screenStyles.title,
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: commonStyles.name,
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  adminText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  premiumBadge: commonStyles.premiumBadge,
  premiumText: commonStyles.premiumText,
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  infoItem: commonStyles.infoItem,
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: commonStyles.infoLabel,
  infoValue: commonStyles.infoValue,
  lastSeen: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 4,
  },
});
