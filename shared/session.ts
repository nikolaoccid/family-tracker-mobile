/**
 * Lets features clean up their own state when the user signs out, without the
 * auth feature importing every other feature.
 */
type Reset = () => void;
const resets = new Set<Reset>();

export const onSessionReset = (reset: Reset): (() => void) => {
  resets.add(reset);
  return () => resets.delete(reset);
};

export const resetSession = () => {
  resets.forEach((reset) => reset());
};
