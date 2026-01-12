import { useSyncExternalStore } from 'react';

/**
 * Hook to detect if code is running on client side
 * Useful for preventing hydration mismatches
 */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}
