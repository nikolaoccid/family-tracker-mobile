import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Plan } from '../model/plan';
import Colors from '@/shared/ui/colors';
import { Check } from 'lucide-react-native';
import { styles } from './SubscriptionCard.styles';

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
