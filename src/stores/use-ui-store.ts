'use client';
import { create } from 'zustand';
type UiState = Readonly<{ isNavigationOpen: boolean }>;
type UiActions = Readonly<{
  setNavigationOpen: (isOpen: boolean) => void;
  toggleNavigation: () => void;
}>;
export const useUiStore = create<UiState & UiActions>((set) => ({
  isNavigationOpen: false,
  setNavigationOpen: (isNavigationOpen) => set({ isNavigationOpen }),
  toggleNavigation: () => set((state) => ({ isNavigationOpen: !state.isNavigationOpen })),
}));
