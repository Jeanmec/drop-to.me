"use client";

import { notify } from "@/library/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react";
import FileAttachment from "./FileAttachment";
import { cn } from "@/library/utils";

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

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={chatContainerRef}
      className="flex h-auto w-full flex-1 flex-col justify-start gap-2 overflow-y-auto px-4"
    >
      {(messages ?? []).length === 0 ? (
        <div className="m-auto text-center text-sm opacity-60">
          Retrieve messages and files received here.
        </div>
      ) : (
        (messages ?? []).map((msg) =>
          msg.system ? (
            <div
              key={msg.id}
              className="animate-bounce-fade-in mx-auto my-1 w-fit rounded-full bg-slate-700/50 px-3 py-0.5 text-center text-xs text-slate-400"
            >
              {msg.content}
            </div>
          ) : (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.received ? "mr-auto items-start" : "ml-auto items-end"}`}
            >
              <div className="">
                <time className="text-xs opacity-50">
                  {msg.timestamp.toLocaleTimeString()}
                </time>
              </div>
              {msg.file ? (
                <FileAttachment file={msg.file} received={msg.received} />
              ) : (
                <div
                  onClick={() => copyToClipboard(msg.content)}
                  className={cn(
                    `animate-bounce-fade-in w-fit cursor-pointer rounded-lg px-2 py-1 ${msg.received ? "bg-primary-blue" : "bg-secondary-blue"}`,
                  )}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ),
        )
      )}
    </div>
  );
}
