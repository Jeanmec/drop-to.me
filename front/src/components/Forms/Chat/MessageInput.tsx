import { sendMessageToTargets } from "@/services/peerService";
import { usePeersStore } from "@/stores/usePeersStore";
import {
  selectIsReconnecting,
  useConnectionStore,
} from "@/stores/useConnectionStore";
import { useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/Icons/Icon";
import { cn } from "@/library/utils";
import styles from "./Chat.module.css";

export default function MessageInput() {
  const [message, setMessage] = useState<string>("");

  const { targetPeers } = usePeersStore();
  const isReconnecting = useConnectionStore(selectIsReconnecting);
  const isAlone = targetPeers.length === 0;
  const canSend = targetPeers.some((peer) => peer.isReachable);

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!canSend || !trimmed) {
      return;
    }

    if (sendMessageToTargets(trimmed)) {
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!canSend) {
    return (
      <div
        role="status"
        className={cn(
          styles.composer,
          "text-ash grid h-13.5 place-items-center px-4 text-center font-mono text-xs",
        )}
      >
        {isAlone && !isReconnecting
          ? "Can't send messages while alone."
          : "Waiting for reconnection..."}
      </div>
    );
  }

  return (
    <div
      className={cn(styles.composer, "flex items-center gap-2.5 px-3 pt-2.5")}
    >
      <input
        type="text"
        className="border-ash placeholder:text-ash/75 h-11 min-w-0 flex-1 border-b bg-transparent px-0.5"
        placeholder="Your message here"
        aria-label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        required
      />
      <button
        type="button"
        aria-label="Send message"
        className="bg-moon grid size-11 shrink-0 cursor-pointer place-items-center rounded-full"
        onClick={handleSendMessage}
      >
        <Icon.send className="text-night size-5" />
      </button>
    </div>
  );
}
