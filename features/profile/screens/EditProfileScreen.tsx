import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, User, Mail, Phone, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/shared/ui/colors';
import { useAuthStore, useUpdateProfile, type User as AppUser } from '@/features/auth';
import { logger } from '@/shared/logger';
import Avatar from '@/shared/ui/Avatar';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

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
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    
    // Validate name
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    }
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    // Validate phone (optional)
    if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
      setPhoneError('Phone number is invalid');
      isValid = false;
    }
    
    return isValid;
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
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
    </KeyboardAvoidingView>
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  changePhotoText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  saveButton: {
    marginTop: 16,
  },
});