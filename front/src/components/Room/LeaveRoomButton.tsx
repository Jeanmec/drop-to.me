"use client";

import { useRoomStore } from "@/stores/useRoomStore";
import { cn } from "@/library/utils";
import { notify } from "@/library/toastService";
import styles from "./Room.module.css";

export function LeaveRoomButton() {
  const setRoomCode = useRoomStore((s) => s.setRoomCode);

  const handleLeave = () => {
    setRoomCode(null);
    notify.info(
      "You left the room. You're back with the devices on your network.",
    );
  };

  return (
    <button
      type="button"
      onClick={handleLeave}
      className="group ml-0.5 h-11 cursor-pointer"
      aria-label="Leave room"
    >
      <span
        className={cn(
          styles.tab,
          "bg-night text-moon text-micro group-hover:bg-moon group-hover:text-night font-mono tracking-widest uppercase",
        )}
      >
        Leave
      </span>
    </button>
  );
}
