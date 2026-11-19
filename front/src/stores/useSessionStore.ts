import { create } from "zustand";

const FAILED_ATTEMPTS_BEFORE_UNREACHABLE = 3;

interface SessionStore {
  isSocketConnected: boolean;
  hasConnected: boolean;
  failedAttempts: number;
  isJoining: boolean;
  isRoomJoined: boolean;
  // between a forced reconnection and its outcome: the links are about to be replaced
  isRejoining: boolean;
  ip: string | null;
  isBrowserUnsupported: boolean;
  setSocketConnected: (isSocketConnected: boolean) => void;
  recordFailedAttempt: () => void;
  startJoining: () => void;
  completeJoin: (ip: string) => void;
  startRejoining: () => void;
  finishRejoining: () => void;
  markBrowserUnsupported: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  isSocketConnected: false,
  hasConnected: false,
  failedAttempts: 0,
  isJoining: false,
  isRoomJoined: false,
  isRejoining: false,
  ip: null,
  isBrowserUnsupported: false,

  setSocketConnected: (isSocketConnected) =>
    set((state) => ({
      isSocketConnected,
      hasConnected: state.hasConnected || isSocketConnected,
      failedAttempts: isSocketConnected ? 0 : state.failedAttempts,
    })),

  recordFailedAttempt: () =>
    set((state) => ({
      failedAttempts: state.failedAttempts + 1,
      isRejoining: false,
    })),

  startJoining: () => set({ isJoining: true, isRoomJoined: false }),

  completeJoin: (ip) =>
    set((state) => ({
      isJoining: false,
      isRoomJoined: true,
      ip: ip || state.ip,
    })),

  startRejoining: () => set({ isRejoining: true }),

  finishRejoining: () => set({ isRejoining: false }),

  markBrowserUnsupported: () => set({ isBrowserUnsupported: true }),
}));

export const selectIsReconnecting = (state: SessionStore): boolean =>
  state.hasConnected && !state.isSocketConnected;

export const selectIsServerUnreachable = (state: SessionStore): boolean =>
  state.failedAttempts >= FAILED_ATTEMPTS_BEFORE_UNREACHABLE;
