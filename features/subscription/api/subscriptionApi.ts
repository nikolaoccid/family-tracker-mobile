import { z } from 'zod';
import { http } from '@/shared/api';
import { paymentIntentSchema, planSchema } from '../model/plan';

export const subscriptionApi = {
  plans: (signal?: AbortSignal) => http.get('/subscription/plans', { schema: z.array(planSchema), signal }),
  subscribe: (planId: string) => http.post('/subscription', { planId }),
  cancel: () => http.delete('/subscription'),
  // The server takes the customer email from the signed-in user; sending it is rejected.
  createPaymentIntent: (amount: number, currency: string) =>
    http.post('/payments/create-payment-intent', { amount, currency }, { schema: paymentIntentSchema }),
};
