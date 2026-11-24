import { z } from 'zod';
import { opt, numeric } from '@/shared/api';

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: numeric,
  features: z.array(z.string()).nullish().transform((v) => v ?? []),
  isPopular: opt(z.boolean()),
});
export type Plan = z.infer<typeof planSchema>;

export const paymentIntentSchema = z.object({
  clientSecret: z.string(),
  customerId: z.string().nullish(),
});
