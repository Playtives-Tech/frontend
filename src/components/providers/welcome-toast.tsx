'use client';

import { useEffect } from 'react';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/use-auth-store';

export function WelcomeToast(): null {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    if (!hasHydrated || !user) return;
    const timeoutId = window.setTimeout(() => {
      notify.success('Welcome back to Playtives', {
        description: 'Your investment journey is ready when you are.',
      });
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [hasHydrated, user]);
  return null;
}
