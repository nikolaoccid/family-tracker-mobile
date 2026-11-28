import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { styles } from './ForgotPasswordScreen.styles';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { requestPasswordReset: resetPassword, isLoading, error, clearError } = useAuthFlow();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setEmail('');
      setEmailError('');
      setIsSubmitted(false);
      clearError();
    });

    return unsubscribe;
  }, [navigation, clearError]);

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

  const handleResetPassword = async () => {
    if (validateForm()) {
      if (await resetPassword(email)) setIsSubmitted(true);
    }
  };

  const handleBackToLogin = () => {
    setEmail('');
    setEmailError('');
    setIsSubmitted(false);
    clearError();
    router.push('/');
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
          onPress={handleBackToLogin}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      {isSubmitted ? (
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={Colors.success} />
          <Text style={styles.successTitle}>Email Sent</Text>
          <Text style={styles.successMessage}>
            We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
          </Text>
          <Button
            title="Back to Login"
            onPress={handleBackToLogin}
            fullWidth
            style={styles.backToLoginButton}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={isLoading}
            fullWidth
            style={styles.resetButton}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

