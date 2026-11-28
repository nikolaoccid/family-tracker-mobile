import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Check, Users, X } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { useInviteFlow } from '../hooks/useInviteFlow';

export function AcceptInviteScreen() {
  const flow = useInviteFlow();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Family Invitation</Text>

        {flow.isVerifying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Verifying invitation...</Text>
          </View>
        ) : flow.failure || !flow.details ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{flow.failure ?? 'Invalid invitation link'}</Text>
            <Button title="Go Back" onPress={flow.goHome} style={styles.errorButton} />
          </View>
        ) : (
          <View style={styles.inviteContainer}>
            <View style={styles.iconContainer}>
              <Users size={40} color={Colors.primary} />
            </View>
            <Text style={styles.inviteText}>
              You have been invited to join<Text style={styles.familyName}> {flow.details.familyName}</Text>
            </Text>
            <Text style={styles.emailText}>
              Invitation sent to: <Text style={styles.emailHighlight}>{flow.details.inviteeMail}</Text>
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title="Decline"
                onPress={flow.reject}
                variant="outline"
                loading={flow.isRejecting}
                icon={<X size={20} color={Colors.danger} />}
                style={styles.declineButton}
                textStyle={{ color: Colors.danger }}
              />
              <Button
                title="Accept"
                onPress={flow.accept}
                loading={flow.isAccepting}
                icon={<Check size={20} color={Colors.white} />}
                style={styles.acceptButton}
              />
            </View>
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
