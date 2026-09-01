'use client';

import { useEffect, useRef } from 'react';
import { getSessionLastActivity, markSessionActivity } from '@/lib/session';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

type SessionTimeoutOptions = Readonly<{
  enabled: boolean;
  onInactive: () => void;
  onPageLeave: () => void;
}>;

export function useSessionTimeout({
  enabled,
  onInactive,
  onPageLeave,
}: SessionTimeoutOptions): void {
  const inactiveHandler = useRef(onInactive);
  const pageLeaveHandler = useRef(onPageLeave);

  useEffect(() => {
    inactiveHandler.current = onInactive;
    pageLeaveHandler.current = onPageLeave;
  }, [onInactive, onPageLeave]);

  useEffect(() => {
    if (!enabled) return;
    let sessionEnded = false;

    const endForInactivity = (): void => {
      if (sessionEnded) return;
      sessionEnded = true;
      inactiveHandler.current();
    };
    const checkForInactivity = (): void => {
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
      if (document.visibilityState === 'visible') checkForInactivity();
    };
    const handlePageHide = (): void => {
      if (sessionEnded) return;
      sessionEnded = true;
      pageLeaveHandler.current();
    };

    checkForInactivity();
    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('scroll', recordActivity, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = window.setInterval(checkForInactivity, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, [enabled]);
}
