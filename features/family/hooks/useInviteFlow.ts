import { useMemo } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/logger';
import { errorMessage } from '@/shared/api';
import { useAuthStore } from '@/features/auth';
import { familyApi } from '../api/familyApi';
import { familyKeys } from '../model/keys';
import { parseInviteParams } from '../model/inviteLink';

/** Params from the route, or from the URL the app was opened with. Both are validated. */
function useValidatedInvite() {
  const params = useLocalSearchParams();
  const initialUrl = Linking.useURL();
  return useMemo(() => {
    const fromRoute = parseInviteParams(params);
    if (fromRoute) return fromRoute;
    return initialUrl ? parseInviteParams(Linking.parse(initialUrl).queryParams) : null;
  }, [params, initialUrl]);
}

export function useInviteFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const invite = useValidatedInvite();
  const home = isAuthenticated ? '/(tabs)' : '/(auth)';

  const details = useQuery({
    queryKey: familyKeys.invite(invite?.token ?? ''),
    queryFn: () => familyApi.verifyInvite(invite?.token as string),
    enabled: !!invite,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => familyApi.acceptInvite(invite?.token as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: familyKeys.current() });
      Alert.alert('Invitation Accepted', `You have successfully joined ${details.data?.familyName}!`, [
        { text: 'Go to Family', onPress: () => router.replace('/(tabs)/family') },
      ]);
    },
    onError: (error) => logger.warn('accept invite failed', error),
  });

  const reject = useMutation({
    mutationFn: () => familyApi.rejectInvite(invite?.token as string),
    onSuccess: () =>
      Alert.alert('Invitation Declined', 'You have declined the family invitation.', [
        { text: 'OK', onPress: () => router.replace(home) },
      ]),
    onError: (error) => logger.warn('decline invite failed', error),
  });

  const handleAccept = () => {
    if (!invite) return;
    if (!isAuthenticated) {
      // Sign in first; the login screen returns here with the same params.
      router.push({
        pathname: '/(auth)',
        params: { returnTo: 'family/accept-invite', invitedEmail: invite.invitedEmail, token: invite.token },
      });
      return;
    }
    accept.mutate();
  };

  const failure = !invite
    ? 'Invalid invitation link'
    : details.error
      ? errorMessage(details.error, 'Could not verify the invitation')
      : accept.error || reject.error
        ? 'Failed to process the invitation. Please try again.'
        : null;

  return {
    invite,
    details: details.data ?? null,
    isVerifying: !!invite && details.isPending,
    failure,
    isAccepting: accept.isPending,
    isRejecting: reject.isPending,
    accept: handleAccept,
    reject: () => reject.mutate(),
    goHome: () => router.replace(home),
  };
}
