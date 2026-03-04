"use client";

import { useEffect, useState } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSocket } from "@/contexts/SocketProvider";
import { JoinRoomModal } from "./JoinRoomModal";
import { RoomCode } from "./RoomCode";
import { LeaveRoomButton } from "./LeaveRoomButton";

export function RoomControls() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const roomCode = useRoomStore((s) => s.roomCode);
  const { isRoomJoined, isJoining } = useSocket();

  useEffect(() => {
    if (isJoining) setIsJoinOpen(false);
  }, [isJoining]);

  const showJoinButton = !roomCode;
  const showRoomCode = isRoomJoined && roomCode;
  const showLeaveButton = isRoomJoined && !!roomCode;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showRoomCode && <RoomCode />}

      {showJoinButton && (
        <button
          type="button"
          onClick={() => setIsJoinOpen(true)}
          className="rounded-lg border-2 border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
        >
          Enter a room
        </button>
      )}

      {showLeaveButton && <LeaveRoomButton />}

      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
}
