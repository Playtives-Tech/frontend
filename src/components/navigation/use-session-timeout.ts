'use client';

import { useEffect, useRef } from 'react';
import { getSessionLastActivity, markSessionActivity } from '@/lib/session';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const WARNING_DURATION_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 1000;

type SessionTimeoutOptions = Readonly<{
  enabled: boolean;
  onInactive: () => void;
  onWarning: (remainingSeconds: number) => void;
}>;

export function useSessionTimeout({ enabled, onInactive, onWarning }: SessionTimeoutOptions): { staySignedIn: () => void } {
  const inactiveHandler = useRef(onInactive);
  const warningHandler = useRef(onWarning);
  const warningShown = useRef(false);

  useEffect(() => {
    inactiveHandler.current = onInactive;
  }, [onInactive]);
  useEffect(() => { warningHandler.current = onWarning; }, [onWarning]);

  const staySignedIn = (): void => {
    warningShown.current = false;
    markSessionActivity();
  };

  useEffect(() => {
    if (!enabled) return undefined;
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
      const inactiveFor = Date.now() - lastActivity;
      if (inactiveFor >= INACTIVITY_TIMEOUT_MS) {
        endForInactivity();
        return;
      }
      if (inactiveFor >= INACTIVITY_TIMEOUT_MS - WARNING_DURATION_MS) {
        warningShown.current = true;
        warningHandler.current(Math.ceil((INACTIVITY_TIMEOUT_MS - inactiveFor) / 1000));
      }
    };
    const recordActivity = (): void => {
      if (!sessionEnded) { warningShown.current = false; markSessionActivity(); }
    };
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') { warningShown.current = false; markSessionActivity(); }
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

  return { staySignedIn };
}
