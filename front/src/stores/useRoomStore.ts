import { create } from "zustand";
import { normalizeRoomCode, validateRoomCode } from "@droptome/shared";
import { notify } from "@/services/toastService";
import { NoticeLifetime } from "@/types/toast.t";

const ROOM_QUERY_PARAM = "room";

const readRoomParam = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const param = new URLSearchParams(window.location.search).get(
    ROOM_QUERY_PARAM,
  );
  return param === null ? null : normalizeRoomCode(param);
};

const readRoomCodeFromUrl = (): string | null => {
  const roomCode = readRoomParam();
  return roomCode && validateRoomCode(roomCode) ? roomCode : null;
};

// replaces the current history entry: the entry of an open dialog becomes the one of the room
const writeRoomCodeToUrl = (roomCode: string | null): void => {
  const url = new URL(window.location.href);
  if (roomCode) {
    url.searchParams.set(ROOM_QUERY_PARAM, roomCode);
  } else {
    url.searchParams.delete(ROOM_QUERY_PARAM);
  }
  if (url.href !== window.location.href) {
    window.history.replaceState(null, "", url);
  }
};

interface RoomStore {
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomCode: readRoomCodeFromUrl(),

  setRoomCode: (code) => {
    const roomCode = code ? normalizeRoomCode(code) : null;
    writeRoomCodeToUrl(roomCode);
    set({ roomCode });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    useRoomStore.setState({ roomCode: readRoomCodeFromUrl() });
  });

  const linkedRoom = readRoomParam();
  if (linkedRoom && !validateRoomCode(linkedRoom)) {
    notify.warning(
      `"${linkedRoom}" isn't a valid room code, so you're in your network's default room.`,
      NoticeLifetime.LONG,
    );
  }
}
