import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import Colors from '@/shared/ui/colors';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { useAuthStore } from '../model/authStore';
import { config, createHttpClient } from '@/shared/api';
import { googleProfileSchema } from '../model/googleProfile';
import { logger } from '@/shared/logger';
import * as Google from 'expo-auth-session/providers/google';


export function LoginScreen() {
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: config.androidClientId,
    iosClientId: config.iosClientId,
    scopes: ['profile', 'email'],
  });
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthFlow();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    const getUserInfo = async () => {
      if (response?.type === 'success') {
        const accessToken = response.authentication?.accessToken;
        if (!accessToken) return;

        try {
          const google = createHttpClient({ baseUrl: '', getToken: () => accessToken });
          const userInfo = await google.get('https://www.googleapis.com/userinfo/v2/me', { schema: googleProfileSchema });
          await loginWithGoogle(userInfo.name, userInfo.email, '');
        } catch (err) {
          logger.warn('could not read Google profile', err);
        }
      }
    };

    if (response) void getUserInfo();
    // `loginWithGoogle` changes identity every render; the effect must run once per auth response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);


  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    clearError();

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await login({ email, password });
    }
  };

    const handleGoogleLogin = async () => {
      try {
        if (Platform.OS === 'android') {
          await promptAsync();
          }} catch (err) {
            logger.warn('Google sign-in failed', err);
          }

      }



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=1470&auto=format&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Family Tracker</Text>
          <Text style={styles.subtitle}>
            Stay connected with your loved ones
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
            icon={<LogIn size={20} color="#FFFFFF" />}
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
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 24,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  orText: {
    color: Colors.light.subtext,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.light.subtext,
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
