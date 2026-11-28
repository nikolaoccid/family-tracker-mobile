import { StyleSheet } from 'react-native';
import { Colors } from '@/shared/ui/theme';

export const commonStyles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
});
