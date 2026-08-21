'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BalanceVisibilityState = Readonly<{ isBalanceVisible: boolean }>;
type BalanceVisibilityActions = Readonly<{ toggleBalanceVisibility: () => void }>;

export const useBalanceVisibilityStore = create<
  BalanceVisibilityState & BalanceVisibilityActions
>()(
  persist(
    (set) => ({
      isBalanceVisible: true,
      toggleBalanceVisibility: () =>
        set((state) => ({ isBalanceVisible: !state.isBalanceVisible })),
    }),
    { name: 'playtives-balance-visibility' },
  ),
);
