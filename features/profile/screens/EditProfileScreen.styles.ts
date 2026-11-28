import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';
import { screenStyles } from '@/shared/ui/screenStyles';

export const styles = StyleSheet.create({
  container: screenStyles.containerAlt3,
  scrollContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  changePhotoText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  saveButton: {
    marginTop: 16,
  },
});
