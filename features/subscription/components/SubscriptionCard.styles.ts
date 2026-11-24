import { StyleSheet } from 'react-native';
import Colors from '@/shared/ui/colors';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  popularContainer: {
    borderColor: Colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 12,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  period: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feature: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 12,
  },
  selectedFeature: {
    color: Colors.light.text,
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  unselectedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  unselectedButtonText: {
    color: Colors.primary,
  },
  selectedText: {
    color: Colors.primary,
  },
});
