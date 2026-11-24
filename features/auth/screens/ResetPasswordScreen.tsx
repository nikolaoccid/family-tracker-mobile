import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { styles } from './ResetPasswordScreen.styles';

export function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { completePasswordReset, isLoading, error, clearError } = useAuthFlow();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const tokenError = token ? '' : 'Invalid or missing reset token. Please request a new password reset link.';

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (validateForm() && token) {
      if (await completePasswordReset(String(token), password)) setIsSubmitted(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
        </View>

        {tokenError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{tokenError}</Text>
            <Button
              title="Back to Login"
              onPress={() => router.push('/')}
              fullWidth
              style={styles.backToLoginButton}
            />
          </View>
        ) : isSubmitted ? (
          <View style={styles.successContainer}>
            <CheckCircle size={64} color={Colors.success} />
            <Text style={styles.successTitle}>Password Reset</Text>
            <Text style={styles.successMessage}>
              Your password has been successfully reset. You can now log in with your new password.
            </Text>
            <Button
              title="Go to Login"
              onPress={() => router.push('/')}
              fullWidth
              style={styles.backToLoginButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Enter your new password below to reset your account password.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="New Password"
              placeholder="Enter your new password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={Colors.light.icon} />}
              error={passwordError}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={Colors.light.icon} />}
              error={confirmPasswordError}
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              style={styles.resetButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

