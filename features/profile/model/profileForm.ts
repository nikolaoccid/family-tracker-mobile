export type ProfileErrors = Partial<Record<'name' | 'email' | 'phone', string>>;

const PHONE = /^\+?[0-9\s\-()]+$/;

export function validateProfile(v: { name: string; email: string; phone: string }): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!v.name) errors.name = 'Name is required';
  if (!v.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(v.email)) errors.email = 'Email is invalid';
  if (v.phone && !PHONE.test(v.phone)) errors.phone = 'Phone number is invalid';
  return errors;
}
