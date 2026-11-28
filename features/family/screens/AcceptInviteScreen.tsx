import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Check, Users, X } from 'lucide-react-native';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { useInviteFlow } from '../hooks/useInviteFlow';
import { styles } from './AcceptInviteScreen.styles';

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
