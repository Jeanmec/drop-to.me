import { create } from "zustand";

const FAILED_ATTEMPTS_BEFORE_UNREACHABLE = 3;

interface SessionStore {
  isSocketConnected: boolean;
  hasConnected: boolean;
  failedAttempts: number;
  isJoining: boolean;
  isRoomJoined: boolean;
  ip: string | null;
  isWebRtcUnsupported: boolean;
  setSocketConnected: (isSocketConnected: boolean) => void;
  recordFailedAttempt: () => void;
  startJoining: () => void;
  completeJoin: (ip: string) => void;
  markWebRtcUnsupported: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  isSocketConnected: false,
  hasConnected: false,
  failedAttempts: 0,
  isJoining: false,
  isRoomJoined: false,
  ip: null,
  isWebRtcUnsupported: false,

  setSocketConnected: (isSocketConnected) =>
    set((state) => ({
      isSocketConnected,
      hasConnected: state.hasConnected || isSocketConnected,
      failedAttempts: isSocketConnected ? 0 : state.failedAttempts,
    })),

  recordFailedAttempt: () =>
    set((state) => ({ failedAttempts: state.failedAttempts + 1 })),

  startJoining: () => set({ isJoining: true, isRoomJoined: false }),

  completeJoin: (ip) =>
    set((state) => ({
      isJoining: false,
      isRoomJoined: true,
      ip: ip || state.ip,
    })),

  markWebRtcUnsupported: () => set({ isWebRtcUnsupported: true }),
}));

export const selectIsReconnecting = (state: SessionStore): boolean =>
  state.hasConnected && !state.isSocketConnected;

export const selectIsServerUnreachable = (state: SessionStore): boolean =>
  state.failedAttempts >= FAILED_ATTEMPTS_BEFORE_UNREACHABLE;
