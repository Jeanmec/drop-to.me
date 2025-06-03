import { create } from "zustand";

interface TabStore {
  activeTab: number;
  setActiveTab: (index: number) => void;
  content?: React.ReactNode;
  setContent: (content: React.ReactNode) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
  content: undefined,
  setContent: (content) => set({ content: content }),
}));
