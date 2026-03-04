"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRoomStore } from "@/stores/useRoomStore";
import { validateRoomCode } from "@droptome/shared";

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
    if (code && validateRoomCode(code) && !roomCodeRef.current) {
      setRoomCode(code);
    }
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
