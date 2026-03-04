"use client";

import { useState } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { Icon } from "@/components/Icons/Icon";
import { notify } from "@/library/toastService";

export function RoomCode() {
  const [copied, setCopied] = useState(false);
  const roomCode = useRoomStore((s) => s.roomCode);

  if (!roomCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-slate-600 bg-slate-800/50 px-3 py-2">
      <span className="text-sm text-slate-400">Room code:</span>
      <span className="font-mono text-lg font-semibold tracking-widest text-emerald-400">
        {roomCode}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Icon.check className="text-base text-emerald-400" />
        ) : (
          <Icon.code className="text-base" />
        )}
      </button>
    </div>
  );
}
