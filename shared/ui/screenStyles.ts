import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';

/** Soft drop shadow shared by raised cards. */
export const cardShadow = {
  shadowColor: Colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
} as const;

export const screenStyles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  errorContainer: {
    backgroundColor: `${Colors.danger}20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  titleAlt: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 24,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  containerAlt: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    marginBottom: 12,
    alignItems: 'center',
  },
  containerAlt2: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  containerAlt3: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
  },
  headerAlt: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  pickerSection: { marginBottom: 24, paddingHorizontal: 24 },
  pickerTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
  pickerList: { paddingBottom: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 16, paddingHorizontal: 24 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
