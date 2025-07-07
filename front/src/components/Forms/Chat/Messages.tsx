"use client";

import { notify } from "@/library/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react";

export default function Messages() {
  const { messages } = useChatStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => notify.success("Text copied to clipboard!"))
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        notify.error("Failed to copy text.");
      });
  };

  const setContainerHeight = () => {
    const el = chatContainerRef.current;
    if (el) {
      const chatContainerHeight = el.clientHeight;
      el.style.setProperty("max-height", `${chatContainerHeight}px`);
    }
  };

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setContainerHeight();

    window.addEventListener("resize", setContainerHeight);

    return () => {
      window.removeEventListener("resize", setContainerHeight);
    };
  }, []);

  return (
    <div
      ref={chatContainerRef}
      className="flex h-auto w-full flex-1 flex-col justify-start space-y-2 overflow-y-auto px-4"
    >
      {(messages ?? []).map((msg, index) => (
        <div
          key={index}
          className={`chat ${msg.received ? "chat-start" : "chat-end"}`}
        >
          <div className="chat-header">
            <time className="text-xs opacity-50">
              {msg.timestamp.toLocaleTimeString()}
            </time>
          </div>
          <div
            onClick={() => copyToClipboard(msg.content)}
            className={`chat-bubble animate-bounce-fade-in cursor-pointer rounded-lg ${
              msg.received ? "bg-primary-blue" : "bg-secondary-blue"
            } `}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
}
