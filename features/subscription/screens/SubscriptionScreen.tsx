import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import { QueryBoundary } from '@/shared/ui';
import Button from '@/shared/ui/Button';
import Colors from '@/shared/ui/colors';
import { confirm } from '@/shared/utils/confirm';
import SubscriptionCard from '../components/SubscriptionCard';
import { usePlans } from '../hooks/usePlans';
import { useSubscriptionActions } from '../hooks/useSubscriptionActions';

export function SubscriptionScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const plans = usePlans();
  const actions = useSubscriptionActions();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(user?.isPremium ? 'premium' : 'free');
  const [failure, setFailure] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setFailure(null);
  };

  const handleContinue = async () => {
    setFailure(null);
    const outcome = selectedPlanId === 'premium' ? await actions.subscribePremium() : await actions.subscribeFree();
    if (outcome.ok) router.back();
    else setFailure(outcome.message);
  };

  const handleCancelSubscription = async () => {
    const ok = await confirm({
      title: 'Cancel Subscription',
      message:
        'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.',
      confirmLabel: 'Yes, Cancel',
      destructive: true,
    });
    if (!ok) return;
    const outcome = await actions.cancel();
    if (outcome.ok) setSelectedPlanId('free');
    else setFailure(outcome.message);
  };

  const transactionFailed = failure !== null;
  const isLoading = actions.busy;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose the plan that best fits your family's needs
        </Text>

        {transactionFailed ? (
          <View style={styles.transactionErrorContainer}>
            <AlertCircle size={24} color={Colors.danger} />
            <Text style={styles.transactionErrorTitle}>Transaction Failed</Text>
            <Text style={styles.transactionErrorText}>
              {failure || 'There was a problem processing your payment. Please try again.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void handleContinue()}
            >
              <RefreshCw size={16} color={Colors.primary} />
              <Text style={styles.retryText}>Retry Payment</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <QueryBoundary query={plans}>
          {(subscriptions) => subscriptions.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
        </QueryBoundary>

        <Text style={styles.disclaimer}>
          You can change or cancel your subscription at any time from the settings.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {user?.isPremium && selectedPlanId === 'free' ? (
          <Button
            title="Cancel Premium Subscription"
            onPress={() => void handleCancelSubscription()}
            variant="danger"
            fullWidth
            style={styles.cancelButton}
          />
        ) : (
          <Button
            title={user?.isPremium ? "Update Subscription" : "Continue"}
            onPress={() => void handleContinue()}
            disabled={!selectedPlanId || isLoading || (user?.isPremium && selectedPlanId === 'premium') || transactionFailed}
            loading={isLoading}
            fullWidth
          />
        )}

        <Button
          title="Back"
          onPress={() => router.back()}
          variant="text"
          fullWidth
          style={styles.backButton}
        />
      </View>
    </View>
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
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
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
  transactionErrorContainer: {
    backgroundColor: `${Colors.danger}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  transactionErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 8,
    marginBottom: 8,
  },
  transactionErrorText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
