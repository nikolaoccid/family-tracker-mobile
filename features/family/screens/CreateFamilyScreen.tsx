import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';

export default function CreateFamilyScreen() {
  const router = useRouter();
  const { createFamily, isLoading } = useFamilyStore();
  const { user } = useAuthStore();

  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a family');
      return;
    }

    try {
      await createFamily(familyName);
      router.replace('/');
    } catch (err) {
      setError('Failed to create family. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Family</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Users size={64} color={Colors.primary} />
        </View>

        <Text style={styles.subtitle}>
          Create a family group to start tracking your loved ones
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Family Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter family name"
            value={familyName}
            onChangeText={(text) => {
              setFamilyName(text);
              setError('');
            }}
            autoCapitalize="words"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>As a family admin, you can:</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>Invite new members to join</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>Create and manage safe zones</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>Remove members from the family</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>Promote other members to admin</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Family"
          onPress={handleCreateFamily}
          isLoading={isLoading}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
