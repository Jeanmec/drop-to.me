import { create } from "zustand";

interface DragFileState {
  isDragFileActive: boolean;
  setIsDragFileActive: (active: boolean) => void;
}

export const useDragFileStore = create<DragFileState>((set) => ({
  isDragFileActive: false,
  setIsDragFileActive: (active) => set({ isDragFileActive: active }),
}));
