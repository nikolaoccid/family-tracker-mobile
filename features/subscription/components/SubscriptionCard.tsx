import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import type { Plan } from '../model/plan';
import Colors from '@/shared/ui/colors';
import { Check } from 'lucide-react-native';

interface SubscriptionCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}

export default function SubscriptionCard({ 
  plan, 
  isSelected, 
  onSelect 
}: SubscriptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        plan.isPopular && styles.popularContainer
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={[styles.name, isSelected && styles.selectedText]}>
          {plan.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.selectedText]}>
            ${plan.price}
          </Text>
          <Text style={styles.period}>/month</Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={16} color={isSelected ? Colors.success : Colors.primary} />
            <Text style={[styles.feature, isSelected && styles.selectedFeature]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
      
      <View 
        style={[
          styles.selectButton,
          isSelected ? styles.selectedButton : styles.unselectedButton
        ]}
      >
        <Text 
          style={[
            styles.selectButtonText,
            isSelected ? styles.selectedButtonText : styles.unselectedButtonText
          ]}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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