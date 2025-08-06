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
      className="flex h-auto w-full flex-1 flex-col justify-start gap-2 overflow-y-auto px-4"
    >
      {(messages ?? []).map((msg, index) => (
        <div
          key={index}
          className={`flex flex-col ${msg.received ? "mr-auto items-start" : "ml-auto items-end"}`}
        >
          <div className="">
            <time className="text-xs opacity-50">
              {msg.timestamp.toLocaleTimeString()}
            </time>
          </div>
          <div
            onClick={() => copyToClipboard(msg.content)}
            className={`animate-bounce-fade-in w-fit cursor-pointer rounded-lg px-2 py-1 ${
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
