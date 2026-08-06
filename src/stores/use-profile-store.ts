'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VerificationStatus = 'not-verified' | 'verified';

export type LinkedAccount = Readonly<{
  id: string;
  bank: string;
  number: string;
  name: string;
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
  removeAccount: (id: string) => void;
  setVerification: (type: 'phone' | 'nin' | 'bvn') => void;
  resetProfile: () => void;
}>;

const initialState: ProfileState = {
  accounts: [{ id: 'gtbank-0176', bank: 'GTBank', number: '0123450176', name: 'Gabriel Ola' }],
  verification: { phone: 'not-verified', nin: 'not-verified', bvn: 'not-verified' },
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      ...initialState,
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      removeAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((account) => account.id !== id) })),
      setVerification: (type) =>
        set((state) => ({ verification: { ...state.verification, [type]: 'verified' } })),
      resetProfile: () => set(initialState),
    }),
    { name: 'playtives-profile', skipHydration: true },
  ),
);
