import { create } from "zustand";
import { validateRoomCode } from "@droptome/shared";

const getInitialRoomCode = (): string | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("room")?.trim().toUpperCase();
  if (code && validateRoomCode(code)) return code;
  return null;
};

interface RoomStore {
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomCode: getInitialRoomCode(),
  setRoomCode: (code) => set({ roomCode: code ? code.toUpperCase() : null }),
}));
