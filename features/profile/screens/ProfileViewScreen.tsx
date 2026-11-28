import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Edit2, Mail, Phone, Calendar, Crown } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { useAuthStore } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/utils/date';
import { InfoRow } from '../components/InfoRow';
import { styles } from './ProfileViewScreen.styles';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function ProfileViewScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleUpgradeSubscription = () => {
    router.push('/subscription');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader title="Profile" onBack={() => router.back()} right={
<TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Edit2 size={20} color={Colors.primary} />
        </TouchableOpacity>
} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar 
            source={user.avatar} 
            name={user.name} 
            size={100} 
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.isPremium ? (
            <View style={styles.premiumBadge}>
              <Crown size={14} color={Colors.light.text} />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.infoSection}>
          <InfoRow icon={<Mail size={20} color={Colors.primary} />} label="Email" value={user.email} />
          {user.phone ? <InfoRow icon={<Phone size={20} color={Colors.primary} />} label="Phone" value={user.phone} /> : null}
          <InfoRow
            icon={<Calendar size={20} color={Colors.primary} />}
            label="Member Since"
            value={formatDate(new Date(user.createdAt))}
          />
        </View>
        
        {!user.isPremium ? (
          <View style={styles.upgradeSection}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeDescription}>
              Get unlimited family members, advanced alerts, and more with our Premium plan.
            </Text>
            <Button
              title="Upgrade Now"
              onPress={handleUpgradeSubscription}
              icon={<Crown size={18} color={Colors.white} />}
              fullWidth
              style={styles.upgradeButton}
            />
          </View>
        ) : (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumTitle}>Premium Benefits</Text>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>Unlimited family members</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>Advanced alerts & notifications</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>30-day location history</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>Unlimited safe zones</Text>
            </View>
            <Button
              title="Manage Subscription"
              onPress={handleUpgradeSubscription}
              variant="outline"
              fullWidth
              style={styles.manageButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

