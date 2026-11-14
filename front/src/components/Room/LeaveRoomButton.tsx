"use client";

import { notify } from "@/services/toastService";
import { useRoomStore } from "@/stores/useRoomStore";

export default function LeaveRoomButton() {
  const setRoomCode = useRoomStore((state) => state.setRoomCode);

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
      aria-label="Leave room"
      className="border-cream text-moon text-micro hover:bg-moon hover:text-night relative cursor-pointer self-stretch border-l px-2.5 font-mono tracking-widest uppercase before:absolute before:inset-x-0 before:-inset-y-1.5"
    >
      Leave
    </button>
  );
}
