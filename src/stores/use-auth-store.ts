'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAccessToken, setAccessToken } from '@/lib/session';

export type KycStatus = 'unverified' | 'in-review' | 'verified';
export type CurrentUser = Readonly<{ name: string; email: string; kycStatus: KycStatus }>;
type AuthState = Readonly<{ user: CurrentUser | null; hasHydrated: boolean }>;
type AuthActions = Readonly<{
  signIn: (user: Omit<CurrentUser, 'kycStatus'>, accessToken: string) => void;
  signOut: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}>;

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      signIn: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user: { ...user, kycStatus: 'unverified' } });
      },
      signOut: () => {
        clearAccessToken();
        set({ user: null });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'playtives-auth',
      skipHydration: true,
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
