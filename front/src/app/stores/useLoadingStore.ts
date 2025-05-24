// src/stores/useLoadingStore.ts
import { create } from "zustand";

interface LoadingStore {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (state: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
  setLoading: (state) => set({ isLoading: state }),
}));
