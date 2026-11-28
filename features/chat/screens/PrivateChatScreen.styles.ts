import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';

export const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.chatMuted,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  errorBanner: {
    backgroundColor: Colors.errorTint,
    padding: 8,
    alignItems: 'center',
  },
  errorBannerText: {
    color: Colors.errorStrong,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },

});
