"use client";

import { useRoomStore } from "@/stores/useRoomStore";

export function LeaveRoomButton() {
  const roomCode = useRoomStore((s) => s.roomCode);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);

  if (!roomCode) return null;

  return (
    <button
      type="button"
      onClick={() => setRoomCode(null)}
      className="rounded-lg border-2 border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-700 hover:bg-red-950/50"
    >
      Leave room
    </button>
  );
}
