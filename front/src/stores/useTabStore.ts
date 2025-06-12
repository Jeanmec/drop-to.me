import { create } from "zustand";

interface TabStore {
  activeTab: string;
  setActiveTab: (id: string) => void;
  content?: React.ReactNode;
  setContent: (content: React.ReactNode) => void;
  background?: React.ReactNode;
  setBackground: (background: React.ReactNode) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "",
  setActiveTab: (id) => set({ activeTab: id }),
  content: undefined,
  setContent: (content) => set({ content }),
  background: undefined,
  setBackground: (background) => set({ background }),
}));
