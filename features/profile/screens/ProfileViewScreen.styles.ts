import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  editButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: commonStyles.profileHeader,
  name: commonStyles.name,
  premiumBadge: commonStyles.premiumBadge,
  premiumText: commonStyles.premiumText,
  infoSection: commonStyles.infoSection,
  upgradeSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
  },
  upgradeButton: {
    marginTop: 8,
  },
  premiumSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  benefitItem: screenStyles.benefitItem,
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  manageButton: {
    marginTop: 16,
  },
});
