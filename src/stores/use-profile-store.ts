'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VerificationStatus = 'not-verified' | 'verified';

export type LinkedAccount = Readonly<{
  id: string;
  bankCode: string;
  bank: string;
  last4: string;
  name: string;
  verifiedAt: string;
}>;

type ProfileState = Readonly<{
  accounts: LinkedAccount[];
  verification: Readonly<{
    phone: VerificationStatus;
    nin: VerificationStatus;
    bvn: VerificationStatus;
  }>;
}>;

type ProfileActions = Readonly<{
  addAccount: (account: LinkedAccount) => void;
  setAccounts: (accounts: LinkedAccount[]) => void;
  removeAccount: (id: string) => void;
  setVerification: (type: 'phone' | 'nin' | 'bvn') => void;
  setVerificationStatus: (type: 'phone' | 'nin' | 'bvn', status: VerificationStatus) => void;
  resetProfile: () => void;
}>;

const initialState: ProfileState = {
  accounts: [],
  verification: { phone: 'not-verified', nin: 'not-verified', bvn: 'not-verified' },
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      ...initialState,
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      setAccounts: (accounts) => set({ accounts }),
      removeAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((account) => account.id !== id) })),
      setVerification: (type) =>
        set((state) => ({ verification: { ...state.verification, [type]: 'verified' } })),
      setVerificationStatus: (type, status) =>
        set((state) => ({ verification: { ...state.verification, [type]: status } })),
      resetProfile: () => set(initialState),
    }),
    { name: 'playtives-profile', skipHydration: true },
  ),
);
