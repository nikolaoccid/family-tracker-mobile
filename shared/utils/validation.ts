const EMAIL = /\S+@\S+\.\S+/;

export function emailError(email: string): string | undefined {
  if (!email) return 'Email is required';
  return EMAIL.test(email) ? undefined : 'Email is invalid';
}
