"use client";

import { notify } from "@/library/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react";
import FileAttachment from "./FileAttachment";
import Pennon from "@/components/ui/Pennon";
import { cn } from "@/library/utils";
import styles from "./Chat.module.css";

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
    <div ref={chatContainerRef} className={styles.flags}>
      {(messages ?? []).length === 0 ? (
        <div className="text-ash m-auto px-4 text-center font-mono text-xs">
          Retrieve messages and files received here.
        </div>
      ) : (
        (messages ?? []).map((msg) =>
          msg.system ? (
            <div
              key={msg.id}
              className="text-ash text-caption self-center font-mono"
            >
              {msg.content}
            </div>
          ) : (
            <div
              key={msg.id}
              className={cn(
                "grid max-w-4/5 gap-0.5",
                msg.received ? "self-start" : "justify-items-end self-end",
                msg.delivery === "pending" && "opacity-60",
              )}
            >
              <time className="text-ash text-caption px-2 font-mono">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              {msg.file ? (
                <FileAttachment file={msg.file} received={msg.received} />
              ) : (
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.content)}
                  className="max-w-full cursor-pointer text-left"
                >
                  <Pennon
                    tone={msg.received ? "plain" : "moon"}
                    notch={msg.received ? "end" : "start"}
                    className={cn(
                      "py-2 text-base leading-snug wrap-anywhere",
                      msg.received ? "pr-6.5 pl-3" : "pr-3 pl-6.5",
                    )}
                  >
                    {msg.content}
                  </Pennon>
                </button>
              )}
              {msg.delivery === "failed" && (
                <span className="text-alert text-caption px-2 font-mono">
                  Not delivered
                </span>
              )}
            </div>
          ),
        )
      )}
    </div>
  );
}
