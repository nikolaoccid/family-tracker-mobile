import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { commonStyles } from './common.styles';

export const styles = StyleSheet.create({
  container: commonStyles.container,
  content: commonStyles.content,
  iconContainer: commonStyles.iconContainer,
  title: commonStyles.title,
  description: commonStyles.description,
  permissionCard: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 12,
  },
  bulletPoints: {
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  privacyNote: {
    fontSize: 12,
    color: Colors.light.subtext,
    fontStyle: 'italic',
  },
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
