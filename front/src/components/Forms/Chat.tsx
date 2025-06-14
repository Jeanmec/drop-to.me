import { useState, useEffect } from "react";
import { peerService } from "@/services/peerService";
import { LuSend } from "react-icons/lu";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useChatStore } from "@/stores/useChatStore";

export default function Chat() {
  const { messages, setMessages, addMessage } = useChatStore();
  const [message, setMessage] = useState<string>("");
  const { isLoading } = useLoadingStore();

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (trimmed) {
      await peerService.sendMessageToTargets(trimmed);
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
    <div className="animate-fade-in-left absolute z-10 container flex h-full flex-1 flex-col items-center justify-end p-2 backdrop-blur-[1px]">
      {(messages?.length ?? 0) > 0 &&
        (messages ?? []).map((msg, index) => (
          <div
            className={`chat ${msg.received ? "chat-start" : "chat-end"}`}
            key={index}
          >
            <div className="chat-header">
              <time className="text-xs opacity-50">
                {msg.timestamp.toLocaleTimeString()}
              </time>
            </div>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}

      <div className="join">
        <div>
          <label className="input join-item">
            <input
              type="text"
              placeholder="Your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              required
            />
            <kbd className="kbd kbd-en">enter</kbd>
          </label>
        </div>
        <button
          className="btn btn-neutral join-item"
          onClick={handleSendMessage}
        >
          <LuSend />
        </button>
      </div>
    </div>
  );
}
