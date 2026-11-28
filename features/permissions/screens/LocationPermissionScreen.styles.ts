import { StyleSheet, Platform } from 'react-native';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: commonStyles.container,
  content: commonStyles.content,
  iconContainer: commonStyles.iconContainer,
  title: commonStyles.title,
  description: commonStyles.description,
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  errorContainer: commonStyles.errorContainer,
  errorText: commonStyles.errorText,
  skipButton: commonStyles.skipButton,
  skipText: commonStyles.skipText,
});
