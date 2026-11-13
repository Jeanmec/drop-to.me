"use client";

import { useRoomStore } from "@/stores/useRoomStore";
import { cn } from "@/library/utils";
import Seamark from "@/components/ui/Seamark";
import { LeaveRoomButton } from "./LeaveRoomButton";
import styles from "./Room.module.css";

export function RoomCode() {
  const roomCode = useRoomStore((s) => s.roomCode);

  if (!roomCode) return null;

  return (
    <Seamark isSteady>
      <span className={styles.roomline}>
        <span
          className={cn(
            styles.tab,
            styles.tabLabel,
            "bg-night text-ash text-micro mr-1.5 font-mono tracking-widest uppercase",
          )}
        >
          Room
        </span>
        <span className="sr-only">{roomCode}</span>
        <span className={styles.bunting} aria-hidden>
          {[...roomCode].map((letter, index) => (
            <span
              key={index}
              className={cn(
                styles.pennant,
                styles.letter,
                "text-label font-mono max-md:text-xs",
              )}
            >
              {letter}
            </span>
          ))}
        </span>
        <LeaveRoomButton />
      </span>
    </Seamark>
  );
}
