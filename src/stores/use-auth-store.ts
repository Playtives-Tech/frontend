'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAccessToken, setAccessToken } from '@/lib/session';

export type CurrentUser = Readonly<{
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null;
}>;
type AuthState = Readonly<{ user: CurrentUser | null; hasHydrated: boolean }>;
type AuthActions = Readonly<{
  signIn: (user: CurrentUser, accessToken: string) => void;
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
        set({ user });
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
