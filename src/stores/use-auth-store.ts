'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KycStatus = 'unverified' | 'in-review' | 'verified';
export type CurrentUser = Readonly<{ name: string; email: string; kycStatus: KycStatus }>;
type AuthState = Readonly<{ user: CurrentUser | null; hasHydrated: boolean }>;
type AuthActions = Readonly<{
  signIn: (user: Omit<CurrentUser, 'kycStatus'>) => void;
  signOut: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}>;

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      signIn: (user) => set({ user: { ...user, kycStatus: 'unverified' } }),
      signOut: () => set({ user: null }),
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
