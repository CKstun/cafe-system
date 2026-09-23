import { useEffect, useRef, useCallback, useId } from 'react';
import { useCafe } from '../context/CafeContext';

export interface UnsavedChangesGuardOptions {
  when: boolean;
  role?: 'customer' | 'staff' | 'admin';
  reason?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const DEFAULT_WARNING_MESSAGE =
  'You have unsaved changes or active actions in progress. Are you sure you want to leave?';

/**
 * useUnsavedChangesGuard
 * 
 * Protects against accidental page refresh, tab closure, and intra-app route transitions.
 * Coordinates with the global CafeContext unsaved registry across Customer, Staff, and Admin portals.
 * 
 * @param when - Boolean indicating whether the guard is currently active (e.g. dirty form, open modal, active cart)
 * @param role - Role associated with the guard ('customer' | 'staff' | 'admin')
 * @param reason - Descriptive context for debugging or logging
 * @param message - Standard warning alert text
 */
export function useUnsavedChangesGuard({
  when,
  role = 'customer',
  reason = 'Active changes in progress',
  message = DEFAULT_WARNING_MESSAGE,
}: UnsavedChangesGuardOptions) {
  const generatedId = useId();
  const guardId = `guard-${role}-${generatedId}`;

  const whenRef = useRef(when);
  whenRef.current = when;

  const messageRef = useRef(message);
  messageRef.current = message;

  // Attempt to integrate with global CafeContext registry if mounted within CafeProvider
  let cafeContext: ReturnType<typeof useCafe> | null = null;
  try {
    cafeContext = useCafe();
  } catch {
    cafeContext = null;
  }

  const registerUnsavedGuard = cafeContext?.registerUnsavedGuard;
  const unregisterUnsavedGuard = cafeContext?.unregisterUnsavedGuard;

  // Sync with global registry
  useEffect(() => {
    if (!registerUnsavedGuard || !unregisterUnsavedGuard) return;

    if (when) {
      registerUnsavedGuard(guardId, role, reason);
    } else {
      unregisterUnsavedGuard(guardId);
    }

    return () => {
      unregisterUnsavedGuard(guardId);
    };
  }, [when, guardId, role, reason, registerUnsavedGuard, unregisterUnsavedGuard]);

  // 1. Standalone Browser Unload Guard (tab close, browser refresh F5/Cmd+R, address bar exit)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!whenRef.current) return;

      event.preventDefault();
      event.returnValue = messageRef.current;
      return messageRef.current;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 2. Navigation confirmation helper for custom links or actions
  const confirmNavigation = useCallback((): boolean => {
    if (!whenRef.current) return true;
    return window.confirm(messageRef.current);
  }, []);

  return {
    isGuarded: when,
    confirmNavigation,
    warningMessage: message,
  };
}

export default useUnsavedChangesGuard;
