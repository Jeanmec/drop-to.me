"use client";

import { useCallback, useState } from "react";
import Pennon from "@/components/ui/Pennon";
import Seamark from "@/components/ui/Seamark";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSessionStore } from "@/stores/useSessionStore";
import JoinRoomModal from "./JoinRoomModal";
import RoomCode from "./RoomCode";

export default function RoomControls() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const closeJoinModal = useCallback(() => setIsJoinOpen(false), []);
  const roomCode = useRoomStore((state) => state.roomCode);
  const isRoomJoined = useSessionStore((state) => state.isRoomJoined);

  return (
    <>
      <div className="absolute bottom-4 left-7 max-md:bottom-3 max-md:left-3">
        {roomCode && isRoomJoined && <RoomCode roomCode={roomCode} />}

        {!roomCode && (
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="group block cursor-pointer text-left"
          >
            <Seamark>
              <Pennon className="group-hover:text-moon text-label block min-h-7.5 w-max py-1.5 pr-6 pl-2.5 font-mono leading-4.5 tracking-wider whitespace-nowrap max-md:text-xs">
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
