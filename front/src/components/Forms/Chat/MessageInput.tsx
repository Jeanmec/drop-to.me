import { peerService } from "@/services/peerService";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";
import { LuSend } from "react-icons/lu";
import { statService } from "@/services/statService";

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
    <div className="join mt-2">
      <label className="input join-item border-primary-blue h-12 border-2 border-r-0 bg-black p-2 text-lg focus:outline-none">
        <input
          type="text"
          placeholder="Your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          required
        />
        <kbd className="kbd kbd-en hidden md:flex">enter</kbd>
      </label>
      <button
        className="join-item hover:bg-primary-blue border-secondary-blue flex w-12 cursor-pointer items-center justify-center border-2 border-l-0 bg-black text-xl transition-all duration-200"
        onClick={handleSendMessage}
      >
        <LuSend />
      </button>
    </div>
  );
}
