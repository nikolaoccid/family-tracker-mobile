export type DeletionOutcome = 'cancelled' | 'deleted' | 'failed';

interface Steps {
  confirm: () => Promise<boolean>;
  /** Deletes the account on the server. */
  remove: () => Promise<unknown>;
  /** Ends the session and wipes local data. Only runs after the server confirmed. */
  clear: () => Promise<void> | void;
}

/**
 * Confirm, delete on the server, then wipe the device. Local data is kept when the
 * server call fails, so the user can retry while still signed in.
 */
export async function runAccountDeletion({ confirm, remove, clear }: Steps): Promise<DeletionOutcome> {
  if (!(await confirm())) return 'cancelled';
  try {
    await remove();
  } catch {
    return 'failed';
  }
  await clear();
  return 'deleted';
}
