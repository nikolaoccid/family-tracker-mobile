import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { completePasswordReset, isLoading, error, clearError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

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
      try {
        await completePasswordReset(String(token), password);
        setIsSubmitted(true);
      } catch (error) {
        // Error is handled by the store
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  resetButton: {
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginButton: {
    marginTop: 8,
  },
});
