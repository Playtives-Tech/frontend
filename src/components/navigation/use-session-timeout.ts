'use client';

import { useEffect, useRef } from 'react';
import { getSessionLastActivity, markSessionActivity } from '@/lib/session';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

type SessionTimeoutOptions = Readonly<{
  enabled: boolean;
  onInactive: () => void;
}>;

export function useSessionTimeout({ enabled, onInactive }: SessionTimeoutOptions): void {
  const inactiveHandler = useRef(onInactive);

  useEffect(() => {
    inactiveHandler.current = onInactive;
  }, [onInactive]);

  useEffect(() => {
    if (!enabled) return;
    let sessionEnded = false;

    const endForInactivity = (): void => {
      if (sessionEnded) return;
      sessionEnded = true;
      inactiveHandler.current();
    };
    const checkForInactivity = (): void => {
      if (document.visibilityState !== 'visible') return;
      const lastActivity = getSessionLastActivity();
      if (lastActivity === null) {
        markSessionActivity();
        return;
      }
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) endForInactivity();
    };
    const recordActivity = (): void => {
      if (!sessionEnded) markSessionActivity();
    };
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') markSessionActivity();
    };

    checkForInactivity();
    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('scroll', recordActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = window.setInterval(checkForInactivity, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, [enabled]);
}
