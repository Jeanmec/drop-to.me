import { sendMessageToTargets } from "@/services/peerService";
import { useChatStore } from "@/stores/useChatStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { statService } from "@/services/statService";
import { useState } from "react";
import { Icon } from "@/components/Icons/Icon";

export default function MessageInput() {
  const [message, setMessage] = useState<string>("");

  const { addMessage } = useChatStore();
  const { targetPeers } = usePeersStore();
  const isAlone = targetPeers.length === 0;

  const handleSendMessage = async () => {
    if (isAlone) return;

    const trimmed = message.trim();
    if (trimmed) {
      await sendMessageToTargets(trimmed);

      statService.addMessageStat();
      addMessage({
        received: false,
        content: trimmed,
        timestamp: new Date(),
      });
      setMessage("");
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  if (isAlone) {
    return (
      <div className="flex h-12 w-full items-center justify-center px-4 text-sm text-gray-500 italic">
        Can&apos;t send messages while alone.
      </div>
    );
  }

  return (
    <div className="flex h-12 w-full items-center rounded-md bg-stone-700 pl-4">
      <div className="relative flex flex-1">
        <input
          type="text"
          className="w-full border-none focus:border-none focus:shadow-none focus:ring-0 focus:outline-none"
          placeholder="Your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          required
        />
      </div>
      <button
        className="hover:bg-primary-blue flex h-full w-12 cursor-pointer items-center justify-center text-xl transition-all duration-200"
        onClick={handleSendMessage}
      >
        <Icon.send />
      </button>
    </div>
  );
}
