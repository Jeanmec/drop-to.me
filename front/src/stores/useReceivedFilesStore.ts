import { create } from "zustand";

interface ReceivedFilesStore {
  fileToastIds: string[];
  addFileToast: (toastId: string) => void;
  removeFileToast: (toastId: string) => void;
}

export const useReceivedFilesStore = create<ReceivedFilesStore>((set) => ({
  fileToastIds: [],

  addFileToast: (toastId) =>
    set((state) => ({ fileToastIds: [...state.fileToastIds, toastId] })),

  removeFileToast: (toastId) =>
    set((state) => ({
      fileToastIds: state.fileToastIds.filter((id) => id !== toastId),
    })),
}));
