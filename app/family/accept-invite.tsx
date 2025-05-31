import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Users, Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { familyController } from '@/api/familyController';

export default function AcceptInviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { family, fetchFamily } = useFamilyStore();

  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  // Parse URL parameters
  useEffect(() => {
    const email = params.invitedEmail as string;
    const token = params.token as string;

    if (email && token) {
      setInviteEmail(email);
      setInviteToken(token);
    } else {
      // Try to parse from URL if deep linked
      Linking.getInitialURL().then((url) => {
        if (url) {
          try {
            const urlObj = new URL(url);
            const searchParams = new URLSearchParams(urlObj.search);
            const email = searchParams.get('invitedEmail');
            const token = searchParams.get('token');

            if (email && token) {
              setInviteEmail(email);
              setInviteToken(token);
            } else {
              setError("Invalid invitation link");
            }
          } catch (e) {
            setError("Could not parse invitation link");
          }
        } else {
          setError("No invitation details found");
        }
      });
    }
  }, [params]);

  // Verify the invitation token
  useEffect(() => {
    const verifyInvite = async () => {
      if (!inviteEmail || !inviteToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const details = await familyController.verifyInvite(inviteToken);
        setInviteDetails(details);
        setInviteEmail(details.inviteeMail)
      } catch (err) {

      } finally {
        setIsLoading(false);
      }
    };

    verifyInvite();
  }, [inviteEmail, inviteToken]);

  // Check if user is already in a family
  useEffect(() => {
    if (isAuthenticated && family) {
      // If user already has a family, show warning
      if (family.id && inviteDetails) {
        Alert.alert(
          "Already in a Family",
          "You are already a member of a family. Accepting this invitation will remove you from your current family.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Continue", style: "destructive" }
          ]
        );
      }
    }
  }, [isAuthenticated, family, inviteDetails]);

  // Handle accept invitation
  const handleAccept = async () => {
    if (!inviteToken || !inviteDetails) return;

    setIsAccepting(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        // If not logged in, redirect to login with return URL
        router.push({
          pathname: '/(auth)',
          params: {
            returnTo: 'family/accept-invite',
            invitedEmail: inviteEmail,
            token: inviteToken
          }
        });
        return;
      }

      // Accept the invitation
      await familyController.acceptInvite(inviteToken);

      // Refresh family data
      await fetchFamily();

      // Show success message
      Alert.alert(
        "Invitation Accepted",
        `You have successfully joined ${inviteDetails.familyName}!`,
        [
          {
            text: "Go to Family",
            onPress: () => router.replace('/(tabs)/family')
          }
        ]
      );
    } catch (err) {
      setError("Failed to accept invitation. Please try again.");
      console.error("Accept invitation error:", err);
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle reject invitation
  const handleReject = async () => {
    if (!inviteToken) return;

    setIsRejecting(true);
    setError(null);

    try {
      await familyController.rejectInvite(inviteToken);

      // Show success message and redirect
      Alert.alert(
        "Invitation Declined",
        "You have declined the family invitation.",
        [
          {
            text: "OK",
            onPress: () => router.replace(isAuthenticated ? '/(tabs)' : '/(auth)')
          }
        ]
      );
    } catch (err) {
      setError("Failed to decline invitation. Please try again.");
      console.error("Reject invitation error:", err);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=1470&auto=format&fit=crop' }}
          style={styles.logo}
        />

        <Text style={styles.title}>Family Invitation</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Verifying invitation...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Go Back"
              onPress={() => router.replace(isAuthenticated ? '/(tabs)' : '/(auth)')}
              style={styles.errorButton}
            />
          </View>
        ) : inviteDetails ? (
          <View style={styles.inviteContainer}>
            <View style={styles.iconContainer}>
              <Users size={40} color={Colors.primary} />
            </View>

            <Text style={styles.inviteText}>
              You have been invited to join<Text style={styles.familyName}> {inviteDetails.familyName}</Text>
            </Text>

            <Text style={styles.emailText}>
              Invitation sent to: <Text style={styles.emailHighlight}>{inviteEmail}</Text>
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Decline"
                onPress={handleReject}
                variant="outline"
                loading={isRejecting}
                icon={<X size={20} color={Colors.danger} />}
                style={styles.declineButton}
                textStyle={{ color: Colors.danger }}
              />

              <Button
                title="Accept"
                onPress={handleAccept}
                loading={isAccepting}
                icon={<Check size={20} color="#FFFFFF" />}
                style={styles.acceptButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid invitation link</Text>
            <Button
              title="Go Back"
              onPress={() => router.replace(isAuthenticated ? '/(tabs)' : '/(auth)')}
              style={styles.errorButton}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    width: 200,
  },
  inviteContainer: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  inviteText: {
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  inviterName: {
    fontWeight: '700',
  },
  familyName: {
    fontWeight: '700',
  },
  emailText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 32,
    textAlign: 'center',
  },
  emailHighlight: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    borderColor: Colors.danger,
  },
  acceptButton: {
    flex: 1,
  },
});
