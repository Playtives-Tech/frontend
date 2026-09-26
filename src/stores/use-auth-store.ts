'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAccessToken, setAccessToken } from '@/lib/session';

export type CurrentUser = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null;
  memberCode: string | null;
  memberStatus: 'community' | 'pending' | 'active';
  memberIntent: 'LEARN_FIRST' | 'READY_TO_PARTICIPATE' | 'ALREADY_COMMITTED_OR_PAID' | null;
  participationAccessApproved: boolean;
}>;
type AuthState = Readonly<{ user: CurrentUser | null; hasHydrated: boolean }>;
type AuthActions = Readonly<{
  signIn: (user: CurrentUser, accessToken: string) => void;
  updateUser: (user: Partial<CurrentUser>) => void;
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
      updateUser: (user) =>
        set((state) => ({ user: state.user ? { ...state.user, ...user } : null })),
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
