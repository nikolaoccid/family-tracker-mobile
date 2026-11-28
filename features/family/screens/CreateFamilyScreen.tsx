import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Users } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { useAuthStore } from '@/features/auth';
import { useCreateFamily } from '../hooks/useFamilyMutations';
import { Button } from '@/shared/ui/Button';
import { styles } from './CreateFamilyScreen.styles';
import { KeyboardScreen } from '@/shared/ui/KeyboardScreen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function CreateFamilyScreen() {
  const router = useRouter();
  const create = useCreateFamily();
  const isLoading = create.isPending;
  const user = useAuthStore((s) => s.user);

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
      await create.mutateAsync(familyName.trim());
      router.replace('/');
    } catch {
      setError('Failed to create family. Please try again.');
    }
  };

  return (
    <KeyboardScreen style={styles.container} iosOffset={100} androidOffset={0}>
      <ScreenHeader title="Create Family" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Users size={64} color={Colors.primary} />
        </View>

        <Text style={styles.subtitle}>Create a family group to start tracking your loved ones</Text>

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
        <Button title="Create Family" onPress={handleCreateFamily} isLoading={isLoading} fullWidth />
      </View>
    </KeyboardScreen>
  );
}
