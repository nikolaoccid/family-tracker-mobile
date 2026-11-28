import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User, Mail, Phone, Camera } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { useAuthStore, type User as AppUser } from '@/features/auth';
import { Avatar } from '@/shared/ui/Avatar';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useEditProfileForm } from '../hooks/useEditProfileForm';
import { styles } from './EditProfileScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  return user ? <EditProfileForm user={user} /> : null;
}

function EditProfileForm({ user }: { user: AppUser }) {
  const form = useEditProfileForm(user);
  const { name, setName, email, setEmail, phone, setPhone, avatar, nameError, emailError, phoneError, isLoading } = form;

  return (
    <KeyboardScreen style={styles.container}>
      
      <ScreenHeader title="Edit Profile" onBack={form.goBack} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Avatar 
            source={avatar} 
            name={name} 
            size={100} 
          />
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={form.pickImage}
          >
            <Camera size={16} color={Colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.light.icon} />}
            error={nameError}
          />
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.light.icon} />}
            error={emailError}
          />
          
          <Input
            label="Phone (optional)"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.light.icon} />}
            error={phoneError}
          />
          
          <Button
            title="Save Changes"
            onPress={form.save}
            loading={isLoading}
            fullWidth
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardScreen>
  );
}
