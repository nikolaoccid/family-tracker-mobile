import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, CheckCircle } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { validatePasswordReset, type FieldErrors } from '../model/validation';
import { styles } from './ResetPasswordScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import { BackTitleHeader } from '@/shared/ui/ScreenHeader';

export function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { completePasswordReset, isLoading, error, clearError } = useAuthFlow();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'password' | 'confirmPassword'>>({});
  const passwordError = errors.password ?? '';
  const confirmPasswordError = errors.confirmPassword ?? '';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const tokenError = token ? '' : 'Invalid or missing reset token. Please request a new password reset link.';

  const validateForm = () => {
    clearError();
    const found = validatePasswordReset({ password, confirmPassword });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleResetPassword = async () => {
    if (validateForm() && token) {
      if (await completePasswordReset(String(token), password)) setIsSubmitted(true);
    }
  };

  return (
    <KeyboardScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BackTitleHeader title="Reset Password" onBack={() => router.back()} />

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

            {error && <ErrorBanner message={error} />}

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
    </KeyboardScreen>
  );
}

