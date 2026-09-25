import { useState, useEffect, useCallback } from 'react';

export const STORAGE_KEY_CUSTOMER_NAME = 'cafe_pepita_customer_name';
export const STORAGE_KEY_SESSION_ID = 'cafe_pepita_guest_session_id';
export const STORAGE_KEY_SESSION_TIMESTAMP = 'cafe_pepita_guest_session_timestamp';
export const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds (28,800,000 ms)

/**
 * Robust UUID v4 Generator compatible across modern browsers and legacy runtimes.
 */
export function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails in restricted iframe contexts
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Check if the 8-hour guest session is still valid.
 */
export function isGuestSessionActive(timestamp: number | null): boolean {
  if (!timestamp || isNaN(timestamp)) return false;
  return Date.now() - timestamp < EIGHT_HOURS_MS;
}

/**
 * Retrieve the active guest session ID or generate a new UUID v4.
 */
export function getOrCreateGuestSessionId(): string {
  try {
    const existingId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    const timestampStr = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);
    const timestamp = timestampStr ? parseInt(timestampStr, 10) : null;

    if (existingId && isGuestSessionActive(timestamp)) {
      return existingId;
    }

    // Session expired or missing: generate fresh UUID v4
    const newSessionId = generateUUIDv4();
    localStorage.setItem(STORAGE_KEY_SESSION_ID, newSessionId);
    localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, Date.now().toString());
    return newSessionId;
  } catch (err) {
    console.warn('[useGuestSession] localStorage access error:', err);
    return generateUUIDv4();
  }
}

/**
 * Retrieve stored customer name if within active 8-hour session;
 * returns empty string if expired or unpopulated.
 */
export function getStoredGuestCustomerName(): string {
  try {
    const timestampStr = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);
    const timestamp = timestampStr ? parseInt(timestampStr, 10) : null;

    if (!isGuestSessionActive(timestamp)) {
      // 8-hour session has expired: purge stale name to enforce fresh guest entry
      localStorage.removeItem(STORAGE_KEY_CUSTOMER_NAME);
      return '';
    }

    const savedName = localStorage.getItem(STORAGE_KEY_CUSTOMER_NAME);
    return savedName ? savedName.trim() : '';
  } catch (err) {
    console.warn('[useGuestSession] localStorage read error:', err);
    return '';
  }
}

/**
 * Custom hook to manage Guest Customer Identity Lifecycle,
 * 8-hour localStorage persistence, and UUID v4 session disambiguation.
 */
export function useGuestSession() {
  const [guestSessionId, setGuestSessionId] = useState<string>(() => getOrCreateGuestSessionId());
  const [customerName, setCustomerNameState] = useState<string>(() => getStoredGuestCustomerName());
  const [sessionTimestamp, setSessionTimestamp] = useState<number>(() => {
    try {
      const ts = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);
      return ts ? parseInt(ts, 10) : Date.now();
    } catch {
      return Date.now();
    }
  });

  // Re-check and synchronize state from storage
  const syncSessionFromStorage = useCallback(() => {
    try {
      const tsStr = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);
      const ts = tsStr ? parseInt(tsStr, 10) : null;

      if (!isGuestSessionActive(ts)) {
        // Expired: reset name and regenerate UUID v4
        localStorage.removeItem(STORAGE_KEY_CUSTOMER_NAME);
        const freshUuid = generateUUIDv4();
        const now = Date.now();
        localStorage.setItem(STORAGE_KEY_SESSION_ID, freshUuid);
        localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());

        setCustomerNameState('');
        setGuestSessionId(freshUuid);
        setSessionTimestamp(now);
      } else {
        const name = localStorage.getItem(STORAGE_KEY_CUSTOMER_NAME) || '';
        let sid = localStorage.getItem(STORAGE_KEY_SESSION_ID);
        if (!sid) {
          sid = generateUUIDv4();
          localStorage.setItem(STORAGE_KEY_SESSION_ID, sid);
        }
        setCustomerNameState(name.trim());
        setGuestSessionId(sid);
        if (ts) setSessionTimestamp(ts);
      }
    } catch (err) {
      console.warn('[useGuestSession] Error during storage sync:', err);
    }
  }, []);

  // Listen for storage events across tabs & custom dispatch events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_CUSTOMER_NAME ||
        e.key === STORAGE_KEY_SESSION_ID ||
        e.key === STORAGE_KEY_SESSION_TIMESTAMP
      ) {
        syncSessionFromStorage();
      }
    };

    const handleCustomSync = () => {
      syncSessionFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cafe_pepita_guest_session_change', handleCustomSync);

    // Initial sanity check on mount
    syncSessionFromStorage();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cafe_pepita_guest_session_change', handleCustomSync);
    };
  }, [syncSessionFromStorage]);

  /**
   * Save customer name to localStorage under key 'cafe_pepita_customer_name'
   * and update active 8-hour session timestamp.
   */
  const saveCustomerNameAtCheckout = useCallback((name: string) => {
    const trimmed = name ? name.trim() : '';
    try {
      const now = Date.now();
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_CUSTOMER_NAME, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY_CUSTOMER_NAME);
      }
      localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());

      let currentSid = localStorage.getItem(STORAGE_KEY_SESSION_ID);
      if (!currentSid) {
        currentSid = generateUUIDv4();
        localStorage.setItem(STORAGE_KEY_SESSION_ID, currentSid);
      }

      setCustomerNameState(trimmed);
      setGuestSessionId(currentSid);
      setSessionTimestamp(now);

      // Notify sibling components
      window.dispatchEvent(new CustomEvent('cafe_pepita_guest_session_change'));
    } catch (err) {
      console.warn('[useGuestSession] Error saving guest name:', err);
    }
  }, []);

  /**
   * Clear session explicitly (e.g. guest signs out or wishes to clear identity)
   */
  const clearGuestSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOMER_NAME);
      const freshUuid = generateUUIDv4();
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY_SESSION_ID, freshUuid);
      localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());

      setCustomerNameState('');
      setGuestSessionId(freshUuid);
      setSessionTimestamp(now);

      window.dispatchEvent(new CustomEvent('cafe_pepita_guest_session_change'));
    } catch (err) {
      console.warn('[useGuestSession] Error clearing guest session:', err);
    }
  }, []);

  const isSessionActive = isGuestSessionActive(sessionTimestamp);
  const remainingHours = Math.max(
    0,
    Math.round(((sessionTimestamp + EIGHT_HOURS_MS - Date.now()) / (1000 * 60 * 60)) * 10) / 10
  );

  return {
    guestSessionId,
    customerName,
    setCustomerName: saveCustomerNameAtCheckout,
    saveCustomerNameAtCheckout,
    clearGuestSession,
    isSessionActive,
    remainingHours,
    sessionTimestamp,
  };
}

export default useGuestSession;
