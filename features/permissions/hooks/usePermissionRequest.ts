import { useState } from 'react';

export type PermissionStatus = 'pending' | 'granted' | 'denied';

/** Status and busy flag around one permission prompt; the caller supplies what the prompt does. */
export function usePermissionRequest(prompt: () => Promise<PermissionStatus>, onError: (error: unknown) => void) {
  const [status, setStatus] = useState<PermissionStatus>('pending');
  const [isLoading, setIsLoading] = useState(false);

  const request = async () => {
    setIsLoading(true);
    try {
      setStatus(await prompt());
    } catch (error) {
      onError(error);
      setStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  return { status, isLoading, request };
}
