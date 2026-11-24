import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { logger } from '@/shared/logger';
import { isInviteLink, parseInviteParams } from '../model/inviteLink';

/** Opens the accept-invite screen when the app receives a `family-invite` link while running. */
export function useInviteDeepLink() {
  const router = useRouter();
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!isInviteLink(url)) return;
      const params = parseInviteParams(Linking.parse(url).queryParams);
      if (!params) {
        logger.warn('ignored malformed invite link');
        return;
      }
      router.push({ pathname: '/family/accept-invite', params });
    });
    return () => subscription.remove();
  }, [router]);
}
