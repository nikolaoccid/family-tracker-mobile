import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { errorMessage } from '@/shared/api';
import { useFamily } from '../hooks/useFamily';
import { useAddMember } from '../hooks/useFamilyMutations';

export function AddMemberScreen() {
  const router = useRouter();
  const family = useFamily().data;
  const add = useAddMember(family?.id);
  const isLoading = add.isPending;
  const error = add.error ? errorMessage(add.error) : null;
  const clearError = add.reset;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    clearError();

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    return isValid;
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

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email Address"
            placeholder="Enter their email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.light.icon} />}
            error={emailError}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: `${Colors.danger}20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
  },
  sendButton: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
  },
  shareButton: {
    marginBottom: 16,
  },
  doneButton: {
    marginTop: 8,
  },
});
