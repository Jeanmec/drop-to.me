"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSocket } from "@/contexts/SocketProvider";
import Pennon from "@/components/ui/Pennon";
import Seamark from "@/components/ui/Seamark";
import { JoinRoomModal } from "./JoinRoomModal";
import { RoomCode } from "./RoomCode";

export function RoomControls() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const closeJoinModal = useCallback(() => setIsJoinOpen(false), []);
  const roomCode = useRoomStore((s) => s.roomCode);
  const { isRoomJoined, isJoining } = useSocket();

  useEffect(() => {
    if (isJoining) setIsJoinOpen(false);
  }, [isJoining]);

  const showJoinButton = !roomCode;
  const showRoomCode = isRoomJoined && roomCode;

  return (
    <>
      <div className="absolute bottom-4 left-7 max-md:bottom-3 max-md:left-3">
        {showRoomCode && <RoomCode />}

        {showJoinButton && (
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="group block cursor-pointer text-left"
          >
            <Seamark>
              <Pennon className="group-hover:text-moon text-label min-h-7.5 w-max py-1.5 pr-6 pl-2.5 font-mono leading-4.5 tracking-wider whitespace-nowrap max-md:text-xs">
                Enter a room
              </Pennon>
            </Seamark>
          </button>
        )}
      </div>

      <JoinRoomModal isOpen={isJoinOpen} onClose={closeJoinModal} />
    </>
  );
}
