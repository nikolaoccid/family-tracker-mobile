import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { errorMessage } from '@/shared/api';
import { useFamily } from '../hooks/useFamily';
import { useAddMember } from '../hooks/useFamilyMutations';
import { styles } from './AddMemberScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import { emailError } from '@/shared/utils/validation';

export function AddMemberScreen() {
  const router = useRouter();
  const family = useFamily().data;
  const add = useAddMember(family?.id);
  const isLoading = add.isPending;
  const error = add.error ? errorMessage(add.error) : null;
  const clearError = add.reset;

  const [email, setEmail] = useState('');
  const [emailErrorText, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const message = emailError(email) ?? '';
    setEmailError(message);
    clearError();
    return !message;
  };

  const handleAddMember = async () => {
    if (validateForm()) {
      try {
        await add.mutateAsync(email);
        setIsSubmitted(true);
      } catch {
        // surfaced through `error`
      }
    }
  };

  return (
    <KeyboardScreen style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Family Member</Text>
      </View>

      {isSubmitted ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Mail size={64} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Invitation Sent</Text>
          <Text style={styles.successMessage}>
            We've sent an invitation to {email}. They'll be added to your family group once they accept.
          </Text>
          <Button
            title="Done"
            onPress={() => router.back()}
            fullWidth
            style={styles.doneButton}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Invite a family member to join your group. They'll receive an email with instructions.
          </Text>

          {error && <ErrorBanner message={error} />}

          <Input
            label="Email Address"
            placeholder="Enter their email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.light.icon} />}
            error={emailErrorText}
          />

          <Button
            title="Send Invitation"
            onPress={handleAddMember}
            loading={isLoading}
            fullWidth
            style={styles.sendButton}
          />
        </View>
      )}
    </KeyboardScreen>
  );
}

