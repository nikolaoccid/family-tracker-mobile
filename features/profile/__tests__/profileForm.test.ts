import { validateProfile } from '../model/profileForm';

describe('validateProfile', () => {
  it('accepts a complete profile and an empty optional phone', () => {
    expect(validateProfile({ name: 'Ana', email: 'a@example.com', phone: '' })).toEqual({});
    expect(validateProfile({ name: 'Ana', email: 'a@example.com', phone: '+385 (1) 234-567' })).toEqual({});
  });

  it('reports each field', () => {
    expect(validateProfile({ name: '', email: '', phone: 'abc' })).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      phone: 'Phone number is invalid',
    });
    expect(validateProfile({ name: 'A', email: 'nope', phone: '' }).email).toBe('Email is invalid');
  });
});
