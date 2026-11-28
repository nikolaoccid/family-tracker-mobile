import { emailError } from '@/shared/utils/validation';
import { passwordError, validateLogin, validateRegistration } from '../model/validation';

describe('auth form validation', () => {
  it('checks e-mail', () => {
    expect(emailError('')).toBe('Email is required');
    expect(emailError('nope')).toBe('Email is invalid');
    expect(emailError('a@example.com')).toBeUndefined();
  });

  it('checks password length', () => {
    expect(passwordError('')).toBe('Password is required');
    expect(passwordError('12345')).toMatch(/at least 6/);
    expect(passwordError('123456')).toBeUndefined();
  });

  it('login reports only the failing fields', () => {
    expect(validateLogin({ email: 'a@example.com', password: 'secret1' })).toEqual({});
    expect(Object.keys(validateLogin({ email: '', password: '1' }))).toEqual(['email', 'password']);
  });

  it('registration requires a name and a matching confirmation', () => {
    const ok = { name: 'Ana', email: 'a@example.com', password: 'secret1', confirmPassword: 'secret1' };
    expect(validateRegistration(ok)).toEqual({});
    expect(validateRegistration({ ...ok, name: '' }).name).toBe('Name is required');
    expect(validateRegistration({ ...ok, confirmPassword: '' }).confirmPassword).toBe('Please confirm your password');
    expect(validateRegistration({ ...ok, confirmPassword: 'other' }).confirmPassword).toBe('Passwords do not match');
  });
});
