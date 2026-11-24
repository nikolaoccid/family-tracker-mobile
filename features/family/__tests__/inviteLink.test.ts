import { isInviteLink, parseInviteParams } from '../model/inviteLink';
import { isFamilyAdmin } from '../model/permissions';

describe('invite deep links', () => {
  it('recognises family-invite links, including the app scheme', () => {
    expect(isInviteLink('app.familytracker://family-invite?token=a&invitedEmail=b@example.com')).toBe(true);
    expect(isInviteLink('https://familytracker.app/family-invite?x=1')).toBe(true);
    expect(isInviteLink('app.familytracker://reset-password?token=a')).toBe(false);
  });

  it('accepts a well-formed email and token', () => {
    expect(parseInviteParams({ invitedEmail: 'tomas@example.com', token: 'eyJhbGciOi.abc-123_x' })).toEqual({
      invitedEmail: 'tomas@example.com',
      token: 'eyJhbGciOi.abc-123_x',
    });
  });

  it('takes the first value when a param is repeated', () => {
    expect(parseInviteParams({ invitedEmail: ['a@example.com', 'b@example.com'], token: ['t1', 't2'] })).toEqual({
      invitedEmail: 'a@example.com',
      token: 't1',
    });
  });

  it.each([
    ['missing params', {}],
    ['null query', null],
    ['not an email', { invitedEmail: 'not-an-email', token: 't' }],
    ['email with spaces', { invitedEmail: 'a b@example.com', token: 't' }],
    ['token with markup', { invitedEmail: 'a@example.com', token: '<script>alert(1)</script>' }],
    ['token with spaces', { invitedEmail: 'a@example.com', token: 'a b' }],
    ['oversized token', { invitedEmail: 'a@example.com', token: 'a'.repeat(5000) }],
    ['non-string values', { invitedEmail: 42, token: { x: 1 } }],
  ])('rejects %s', (_name, query) => {
    expect(parseInviteParams(query as Record<string, unknown> | null)).toBeNull();
  });
});

describe('isFamilyAdmin', () => {
  const family = { id: 'f', name: '', createdAt: '', ownerId: '', members: [
    { id: 'a', role: 'admin' }, { id: 'b', role: 'member' },
  ] } as never;

  it('is true only for an admin member', () => {
    expect(isFamilyAdmin(family, 'a')).toBe(true);
    expect(isFamilyAdmin(family, 'b')).toBe(false);
    expect(isFamilyAdmin(family, 'zzz')).toBe(false);
    expect(isFamilyAdmin(null, 'a')).toBe(false);
    expect(isFamilyAdmin(family, undefined)).toBe(false);
  });
});
