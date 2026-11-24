import { privateChannelId } from '../model/channel';

describe('privateChannelId', () => {
  it('is the same for both participants regardless of order', () => {
    expect(privateChannelId('alice', 'bob')).toBe(privateChannelId('bob', 'alice'));
  });

  it('differs between pairs', () => {
    expect(privateChannelId('alice', 'bob')).not.toBe(privateChannelId('alice', 'carol'));
  });

  // Values computed with the original implementation. Existing channels live under these ids. A change here orphans every conversation.
  it('keeps producing the ids already stored by released apps', () => {
    expect(privateChannelId('22222222-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000002')).toBe('k0tget');
    expect(privateChannelId('a', 'b')).toBe('1ryip');
  });
});
