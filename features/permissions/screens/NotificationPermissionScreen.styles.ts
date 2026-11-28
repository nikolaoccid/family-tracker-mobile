import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { commonStyles } from './common.styles';
import { screenStyles } from '@/shared/ui/screenStyles';

export const styles = StyleSheet.create({
  container: commonStyles.container,
  content: commonStyles.content,
  iconContainer: commonStyles.iconContainer,
  title: commonStyles.title,
  description: commonStyles.description,
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: screenStyles.benefitItem,
  benefitText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: `${Colors.success}10`,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
  },
  errorContainer: commonStyles.errorContainer,
  errorText: commonStyles.errorText,
  skipButton: commonStyles.skipButton,
  skipText: commonStyles.skipText,
});
