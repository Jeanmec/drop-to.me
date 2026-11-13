"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRoomStore } from "@/stores/useRoomStore";
import { validateRoomCode } from "@droptome/shared";
import { notify } from "@/library/toastService";

const INVALID_ROOM_TOAST_ID = "invalid-room-link";
const INVALID_ROOM_TOAST_DURATION_MS = 7000;

export function RoomUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const roomCode = useRoomStore((s) => s.roomCode);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);

  // Ref avoids having roomCode in deps, which would re-trigger
  // URL→Store sync when leave() clears it (URL still has ?room=XXX at that point).
  const roomCodeRef = useRef(roomCode);
  roomCodeRef.current = roomCode;

  // URL → Store
  useEffect(() => {
    const code = searchParams.get("room")?.trim().toUpperCase();
    if (!code || roomCodeRef.current) {
      return;
    }
    if (validateRoomCode(code)) {
      setRoomCode(code);
      return;
    }
    notify.warning(
      `"${code}" isn't a valid room code, so you're in your network's default room.`,
      INVALID_ROOM_TOAST_DURATION_MS,
      INVALID_ROOM_TOAST_ID,
    );
  }, [searchParams, setRoomCode]);

  // Store → URL
  useEffect(() => {
    const urlRoom = searchParams.get("room")?.trim().toUpperCase() ?? null;
    if (roomCode === urlRoom) return;

    const params = new URLSearchParams(searchParams.toString());
    if (roomCode) {
      params.set("room", roomCode);
    } else {
      params.delete("room");
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  }, [roomCode, pathname, searchParams, router]);

  return null;
}
