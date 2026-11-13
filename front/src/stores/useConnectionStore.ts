import { create } from "zustand";

const FAILED_ATTEMPTS_BEFORE_UNREACHABLE = 3;

interface ConnectionStore {
  isSocketConnected: boolean;
  hasConnected: boolean;
  failedAttempts: number;
  setSocketConnected: (isSocketConnected: boolean) => void;
  recordFailedAttempt: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  isSocketConnected: false,
  hasConnected: false,
  failedAttempts: 0,
  setSocketConnected: (isSocketConnected) =>
    set((state) => ({
      isSocketConnected,
      hasConnected: state.hasConnected || isSocketConnected,
      failedAttempts: isSocketConnected ? 0 : state.failedAttempts,
    })),
  recordFailedAttempt: () =>
    set((state) => ({ failedAttempts: state.failedAttempts + 1 })),
}));

export const selectIsReconnecting = (state: ConnectionStore): boolean =>
  state.hasConnected && !state.isSocketConnected;

export const selectIsServerUnreachable = (state: ConnectionStore): boolean =>
  state.failedAttempts >= FAILED_ATTEMPTS_BEFORE_UNREACHABLE;
