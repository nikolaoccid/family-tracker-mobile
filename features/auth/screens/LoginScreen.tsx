import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Lock, LogIn } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { useAuthStore } from '../model/authStore';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { validateLogin } from '../model/validation';
import { useValidatedSubmit } from '../hooks/useValidatedSubmit';
import { styles } from './LoginScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { EmailInput } from '@/shared/ui/EmailInput';

export function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthFlow();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const handleGoogleLogin = useGoogleSignIn(loginWithGoogle);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errorFor, onSubmit: handleLogin } = useValidatedSubmit({ email, password }, validateLogin, login, clearError);
  const emailError = errorFor('email');
  const passwordError = errorFor('password');

  useEffect(() => {
    if (isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated, router]);

  return (
    <KeyboardScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=1470&auto=format&fit=crop',
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>Family Tracker</Text>
          <Text style={styles.subtitle}>Stay connected with your loved ones</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <EmailInput value={email} onChangeText={setEmail} error={emailError} />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.light.icon} />}
            error={passwordError}
          />

          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            icon={<LogIn size={20} color={Colors.white} />}
            style={styles.loginButton}
          />

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Sign In with Google"
            onPress={handleGoogleLogin}
            variant="outline"
            fullWidth
            style={styles.googleButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardScreen>
  );
}
