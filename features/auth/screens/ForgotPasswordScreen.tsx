import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { styles } from './ForgotPasswordScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import { EmailInput } from '@/shared/ui/EmailInput';
import { emailError } from '@/shared/utils/validation';
import { BackTitleHeader } from '@/shared/ui/ScreenHeader';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { requestPasswordReset: resetPassword, isLoading, error, clearError } = useAuthFlow();

  const [email, setEmail] = useState('');
  const [emailErrorText, setEmailError] = useState('');
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
    const message = emailError(email) ?? '';
    setEmailError(message);
    clearError();
    return !message;
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
    <KeyboardScreen style={styles.container}>

      <BackTitleHeader title="Reset Password" onBack={handleBackToLogin} />

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

          {error && <ErrorBanner message={error} />}

          <EmailInput value={email} onChangeText={setEmail} error={emailErrorText} />

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={isLoading}
            fullWidth
            style={styles.resetButton}
          />
        </View>
      )}
    </KeyboardScreen>
  );
}

