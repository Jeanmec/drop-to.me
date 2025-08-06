import { create } from "zustand";
import { type pages } from "@/config/pages";

export type PageId = keyof typeof pages;
interface TabStore {
  pageId: PageId;
  setPageId: (id: PageId) => void;
  content: React.ReactNode;
  setContent: (content: React.ReactNode) => void;
  background: React.ReactNode;
  setBackground: (background: React.ReactNode) => void;
  delay: number;
  setDelay: (delay: number) => void;
  pageChange: boolean;
  setPageChange: (state: boolean) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  pageId: "file",
  setPageId: (id: PageId) => set({ pageId: id }),
  content: null,
  setContent: (content: React.ReactNode) => set({ content }),
  background: null,
  setBackground: (background: React.ReactNode) => set({ background }),
  delay: 0,
  setDelay: (delay: number) => set({ delay }),
  pageChange: false,
  setPageChange: (state: boolean) => {
    set({ pageChange: state });
  },
}));
