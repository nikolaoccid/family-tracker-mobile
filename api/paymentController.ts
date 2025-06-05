import { getAuthHeaders } from './authUtils';
import { handleApiError } from './utils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const paymentController = {
  createPaymentIntent: async (amount: number, currency: string, email: string) => {
    try {
      const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency, email }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json(); // { clientSecret, customerId }
    } catch (error) {
      console.warn('Create PaymentIntent error:', error);
      throw error;
    }
  },
};
