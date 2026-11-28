import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/shared/ui/theme';
import { useAuthStore, useUpdateProfile, type User as AppUser } from '@/features/auth';
import { logger } from '@/shared/logger';
import { validateProfile, type ProfileErrors } from '../model/profileForm';
import { Avatar } from '@/shared/ui/Avatar';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { styles } from './EditProfileScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  return user ? <EditProfileForm user={user} /> : null;
}

function EditProfileForm({ user }: { user: AppUser }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar);
  
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const nameError = errors.name ?? '';
  const emailError = errors.email ?? '';
  const phoneError = errors.phone ?? '';

  const validateForm = () => {
    const found = validateProfile({ name, email, phone });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        await updateProfile.mutateAsync({ name, email, phone: phone || undefined, avatar });
        router.back();
      } catch (error) {
        logger.warn('profile update failed', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      const picked = result.canceled ? undefined : result.assets[0];
      if (picked) setAvatar(picked.uri);
    } catch (error) {
      logger.warn('image picker failed', error);
    }
  };

  return (
    <KeyboardScreen style={styles.container}>
      
      <ScreenHeader title="Edit Profile" onBack={() => router.back()} />
      
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
            onPress={handlePickImage}
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
            onPress={handleSave}
            loading={isLoading}
            fullWidth
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardScreen>
  );
}
