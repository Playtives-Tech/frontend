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

export type WalletActivity = Readonly<{
  id: string;
  type: 'Deposit' | 'Withdrawal' | 'Distribution' | 'Ownership contribution';
  detail: string;
  amount: number;
  status: 'Completed' | 'Processing';
  reference: string;
  createdAt: string;
}>;

type ProfileState = Readonly<{
  walletBalance: number;
  earningsBalance: number;
  accounts: LinkedAccount[];
  verification: Readonly<{
    phone: VerificationStatus;
    nin: VerificationStatus;
    bvn: VerificationStatus;
  }>;
  activity: WalletActivity[];
}>;

type ProfileActions = Readonly<{
  addAccount: (account: LinkedAccount) => void;
  removeAccount: (id: string) => void;
  setVerification: (type: 'phone' | 'nin' | 'bvn') => void;
  addWithdrawal: (account: LinkedAccount, amount: number) => void;
  resetProfile: () => void;
}>;

const initialState: ProfileState = {
  walletBalance: 2_000_000,
  earningsBalance: 8_000_000,
  accounts: [{ id: 'gtbank-0176', bank: 'GTBank', number: '0176', name: 'Gabriel Ola' }],
  verification: { phone: 'not-verified', nin: 'not-verified', bvn: 'not-verified' },
  activity: [
    {
      id: 'distribution-04',
      type: 'Distribution',
      detail: 'Palm Oil Supply · Cycle 04',
      amount: 1_125_000,
      status: 'Completed',
      reference: 'PLT-DST-00418',
      createdAt: '2026-08-03T09:30:00.000Z',
    },
    {
      id: 'ownership-05',
      type: 'Ownership contribution',
      detail: 'Palm Oil Supply · Cycle 05',
      amount: -15_000_000,
      status: 'Completed',
      reference: 'PLT-OWN-00522',
      createdAt: '2026-08-01T12:00:00.000Z',
    },
    {
      id: 'funding-01',
      type: 'Deposit',
      detail: 'Manual bank transfer',
      amount: 10_000_000,
      status: 'Completed',
      reference: 'PLT-DPT-00961',
      createdAt: '2026-07-30T15:40:00.000Z',
    },
  ],
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
      addWithdrawal: (account, amount) =>
        set((state) => {
          let newEarnings = state.earningsBalance;
          let newWallet = state.walletBalance;

          if (newEarnings >= amount) {
            newEarnings -= amount;
          } else {
            const remainder = amount - newEarnings;
            newEarnings = 0;
            newWallet -= remainder;
          }

          return {
            walletBalance: newWallet,
            earningsBalance: newEarnings,
            activity: [
              {
                id: crypto.randomUUID(),
                type: 'Withdrawal',
                detail: `${account.bank} · ${account.number}`,
                amount: -amount,
                status: 'Processing',
                reference: `PLT-WDL-${Date.now().toString().slice(-6)}`,
                createdAt: new Date().toISOString(),
              },
              ...state.activity,
            ],
          };
        }),
      resetProfile: () => set(initialState),
    }),
    { name: 'playtives-profile', skipHydration: true },
  ),
);
