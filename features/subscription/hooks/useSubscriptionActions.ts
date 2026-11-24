import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuthStore } from '@/features/auth';
import { errorMessage } from '@/shared/api';
import { logger } from '@/shared/logger';
import { subscriptionApi } from '../api/subscriptionApi';

const PREMIUM_PRICE_CENTS = 999;

type Outcome = { ok: true } | { ok: false; message: string };

/** Premium checkout (payment sheet, then activation), the downgrade to Free, and cancellation. */
export function useSubscriptionActions() {
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>): Promise<Outcome> {
    setBusy(true);
    try {
      await action();
      return { ok: true };
    } catch (error) {
      logger.warn('subscription action failed', error);
      return { ok: false, message: errorMessage(error, 'Unexpected payment error') };
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    subscribePremium: () =>
      run(async () => {
        if (!user?.email) throw new Error('User email is required for payment processing');
        const { clientSecret } = await subscriptionApi.createPaymentIntent(PREMIUM_PRICE_CENTS, 'usd');
        const init = await initPaymentSheet({ paymentIntentClientSecret: clientSecret, merchantDisplayName: 'Family Tracker' });
        if (init.error) throw init.error;
        const paid = await presentPaymentSheet();
        if (paid.error) throw paid.error;
        await subscriptionApi.subscribe('premium');
        patchUser({ isPremium: true });
      }),
    subscribeFree: () =>
      run(async () => {
        await subscriptionApi.subscribe('free');
        patchUser({ isPremium: false });
      }),
    cancel: () =>
      run(async () => {
        await subscriptionApi.cancel();
        patchUser({ isPremium: false });
      }),
  };
}
