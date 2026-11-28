import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Lock, User } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { BackTitleHeader } from '@/shared/ui/ScreenHeader';
import { Input } from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { validateRegistration } from '../model/validation';
import { useValidatedSubmit } from '../hooks/useValidatedSubmit';
import { styles } from './RegisterScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import { EmailInput } from '@/shared/ui/EmailInput';

export function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthFlow();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { errorFor, onSubmit: handleRegister } = useValidatedSubmit(
    { name, email, password, confirmPassword },
    validateRegistration,
    async (values) => {
      if (await register(values.name, values.email, values.password)) router.push('/subscription');
    },
    clearError,
  );
  const nameError = errorFor('name');
  const emailError = errorFor('email');
  const passwordError = errorFor('password');
  const confirmPasswordError = errorFor('confirmPassword');

  return (
    <KeyboardScreen style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BackTitleHeader title="Create Account" onBack={() => router.back()} style={styles.header}>
          <Text style={styles.subtitle}>
            Join Family Tracker to stay connected with your loved ones
          </Text>
        </BackTitleHeader>

        <View style={styles.formContainer}>
          {error && <ErrorBanner message={error} />}

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.light.icon} />}
            error={nameError}
          />

          <EmailInput value={email} onChangeText={setEmail} error={emailError} />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.light.icon} />}
            error={passwordError}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.light.icon} />}
            error={confirmPasswordError}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Text style={styles.termsText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardScreen>
  );
}

