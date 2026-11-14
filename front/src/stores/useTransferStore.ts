import { create } from "zustand";
import { TransferPhase, type TSendProgress } from "@/types/transfer.t";

interface TransferStore {
  phase: TransferPhase;
  zippedFileCount: number;
  waitingMessage: string;
  fileName: string;
  // whole percent acknowledged by the slowest peer
  progress: number;
  remainingSeconds: number | null;
  isLong: boolean;
  startZipping: (zippedFileCount: number) => void;
  startWaiting: (waitingMessage: string) => void;
  startSending: (fileName: string) => void;
  reportProgress: (sendProgress: TSendProgress) => void;
  finish: () => void;
  reset: () => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
  phase: TransferPhase.IDLE,
  zippedFileCount: 0,
  waitingMessage: "",
  fileName: "",
  progress: 0,
  remainingSeconds: null,
  isLong: false,

  startZipping: (zippedFileCount) =>
    set({ phase: TransferPhase.ZIPPING, zippedFileCount, isLong: false }),

  startWaiting: (waitingMessage) =>
    set({ phase: TransferPhase.WAITING, waitingMessage, isLong: false }),

  startSending: (fileName) =>
    set({
      phase: TransferPhase.SENDING,
      fileName,
      progress: 0,
      remainingSeconds: null,
      isLong: false,
    }),

  reportProgress: (sendProgress) => set(sendProgress),

  finish: () => set({ phase: TransferPhase.DONE, isLong: false }),

  reset: () => set({ phase: TransferPhase.IDLE, isLong: false }),
}));

export const selectIsTransferLocked = (state: TransferStore): boolean =>
  state.phase === TransferPhase.ZIPPING ||
  state.phase === TransferPhase.WAITING ||
  state.phase === TransferPhase.SENDING;

export const selectIsBeamHeld = (state: TransferStore): boolean =>
  state.phase === TransferPhase.SENDING && state.isLong;
