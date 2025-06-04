import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { useStripe } from '@stripe/stripe-react-native';
import {paymentController} from "@/api/paymentController";
import {subscriptionController} from "@/api";

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    fetchSubscriptions,
    subscriptions,
    selectedPlan,
    selectPlan,
    isLoading,
    error,
    clearError
  } = useSubscriptionStore();
  const { user, updateUser } = useAuthStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    user?.isPremium ? 'premium' : 'free'
  );
  const [transactionFailed, setTransactionFailed] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    selectPlan(planId);
    setTransactionFailed(false);
    setTransactionError(null);
    clearError();
  };

  const handleContinue = async () => {
    if (selectedPlanId === 'premium') {
      try {
        setTransactionFailed(false);
        setTransactionError(null);

        if (!user?.email) {
          throw new Error('User email is required for payment processing');
        }
        const { clientSecret, customerId } = await paymentController.createPaymentIntent(
          999,
          'usd',
          user.email
        );

        const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: 'Family Tracker',
        });

        if (initError) throw initError;

        const { error: paymentError } = await presentPaymentSheet();
        if (paymentError) throw paymentError;

        await subscriptionController.subscribeToPlan('premium');
        updateUser({ isPremium: true });
        router.back();
      } catch (error: any) {
        console.error(error);
        setTransactionFailed(true);
        setTransactionError(error.message || 'Unexpected payment error');
      }
    } else {
      await subscriptionController.subscribeToPlan('free');
      updateUser({ isPremium: false });
      router.back();
    }
  };

  const handleCancelSubscription = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.')) {
        updateUser({ isPremium: false });
        setSelectedPlanId('free');
        selectPlan('free');
      }
    } else {
      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              updateUser({ isPremium: false });
              setSelectedPlanId('free');
              selectPlan('free');
            }
          }
        ]
      );
    }
  };

  const handleRetry = () => {
    setTransactionFailed(false);
    setTransactionError(null);
    handleContinue();
  };

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

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {transactionFailed ? (
          <View style={styles.transactionErrorContainer}>
            <AlertCircle size={24} color={Colors.danger} />
            <Text style={styles.transactionErrorTitle}>Transaction Failed</Text>
            <Text style={styles.transactionErrorText}>
              {transactionError || 'There was a problem processing your payment. Please try again.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <RefreshCw size={16} color={Colors.primary} />
              <Text style={styles.retryText}>Retry Payment</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {subscriptions.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}

        <Text style={styles.disclaimer}>
          You can change or cancel your subscription at any time from the settings.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {user?.isPremium && selectedPlanId === 'free' ? (
          <Button
            title="Cancel Premium Subscription"
            onPress={handleCancelSubscription}
            variant="danger"
            fullWidth
            style={styles.cancelButton}
          />
        ) : (
          <Button
            title={user?.isPremium ? "Update Subscription" : "Continue"}
            onPress={handleContinue}
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
