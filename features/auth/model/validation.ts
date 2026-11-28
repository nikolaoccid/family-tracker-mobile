export type FieldErrors<K extends string> = Partial<Record<K, string>>;

import { emailError } from '@/shared/utils/validation';
export const MIN_PASSWORD_LENGTH = 6;

export function passwordError(password: string): string | undefined {
  if (!password) return 'Password is required';
  return password.length < MIN_PASSWORD_LENGTH ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters` : undefined;
}

const compact = <K extends string>(errors: FieldErrors<K>): FieldErrors<K> =>
  Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined)) as FieldErrors<K>;

export const validateLogin = (v: { email: string; password: string }) =>
  compact<'email' | 'password'>({ email: emailError(v.email), password: passwordError(v.password) });

export function validateRegistration(v: { name: string; email: string; password: string; confirmPassword: string }) {
  return compact<'name' | 'email' | 'password' | 'confirmPassword'>({
    name: v.name ? undefined : 'Name is required',
    email: emailError(v.email),
    password: passwordError(v.password),
    confirmPassword: !v.confirmPassword
      ? 'Please confirm your password'
      : v.password !== v.confirmPassword
        ? 'Passwords do not match'
        : undefined,
  });
}
