import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUpdateProfile, type User as AppUser } from '@/features/auth';
import { logger } from '@/shared/logger';
import { validateProfile, type ProfileErrors } from '../model/profileForm';

/** Form state, validation, saving and avatar picking for the edit-profile screen. */
export function useEditProfileForm(user: AppUser) {
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

  return {
    name, setName, email, setEmail, phone, setPhone, avatar,
    nameError, emailError, phoneError, isLoading,
    save: handleSave, pickImage: handlePickImage, goBack: () => router.back(),
  };
}
