import { peerService } from "@/services/peerService";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";
import { statService } from "@/services/statService";
import { Icon } from "@/components/Icons/Icon";

export default function MessageInput() {
  const [message, setMessage] = useState<string>("");

  const { addMessage } = useChatStore();

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (trimmed) {
      await peerService.sendMessageToTargets(trimmed);

      await statService.sendMessage();
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

  return (
    <div className="border-primary-blue flex h-12 w-full items-center gap-2 rounded-md border-2 pl-4 sm:w-10/12 md:w-8/12 lg:w-6/12">
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
        <kbd className="kbd kbd-en pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 md:flex">
          enter
        </kbd>
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
