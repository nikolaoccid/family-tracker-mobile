import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Edit2, Mail, Phone, Calendar, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';

export default function ProfileViewScreen() {
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
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Edit2 size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
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
          <View style={styles.infoItem}>
            <Mail size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
          
          {user.phone ? (
            <View style={styles.infoItem}>
              <Phone size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          ) : null}
          
          <View style={styles.infoItem}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(new Date(user.createdAt))}</Text>
            </View>
          </View>
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
              icon={<Crown size={18} color="#FFFFFF" />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  editButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
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
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 16,
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
  upgradeSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
  },
  upgradeButton: {
    marginTop: 8,
  },
  premiumSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  manageButton: {
    marginTop: 16,
  },
});
