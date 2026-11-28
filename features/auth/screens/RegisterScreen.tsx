import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Lock, User, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { validateRegistration, type FieldErrors } from '../model/validation';
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

  const [errors, setErrors] = useState<FieldErrors<'name' | 'email' | 'password' | 'confirmPassword'>>({});
  const nameError = errors.name ?? '';
  const emailError = errors.email ?? '';
  const passwordError = errors.password ?? '';
  const confirmPasswordError = errors.confirmPassword ?? '';

  const validateForm = () => {
    clearError();
    const found = validateRegistration({ name, email, password, confirmPassword });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      const isRegisterOk = await register(name, email, password);
      if (isRegisterOk){
        router.push('/subscription');
      }
    }
  };

  return (
    <KeyboardScreen style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Family Tracker to stay connected with your loved ones
          </Text>
        </View>

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

