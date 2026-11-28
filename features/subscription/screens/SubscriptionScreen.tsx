import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/features/auth';
import { QueryBoundary } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { confirm } from '@/shared/utils/confirm';
import { TransactionError } from '../components/TransactionError';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { usePlans } from '../hooks/usePlans';
import { useSubscriptionActions } from '../hooks/useSubscriptionActions';
import { styles } from './SubscriptionScreen.styles';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

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

  const isLoading = actions.busy;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScreenHeader title="Subscription" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose the plan that best fits your family's needs
        </Text>

        {failure !== null ? <TransactionError message={failure} onRetry={() => void handleContinue()} /> : null}

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
            disabled={!selectedPlanId || isLoading || (user?.isPremium && selectedPlanId === 'premium') || failure !== null}
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

