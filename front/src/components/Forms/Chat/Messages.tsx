"use client";

import clsx from "clsx";
import { notify } from "@/services/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { MessageDelivery } from "@/types/message.t";
import { formatClockTime } from "@/utils/time.utils";
import FileAttachment from "./FileAttachment";

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    notify.success("Text copied to clipboard!");
  } catch {
    notify.error("Failed to copy text.");
  }
};

export default function Messages() {
  const messages = useChatStore((state) => state.messages);

  return (
    // a reversed column keeps the scroll pinned to the latest message
    <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-3 py-3.5">
      {messages.length === 0 ? (
        <p className="text-ash m-auto px-4 text-center font-mono text-xs">
          Retrieve messages and files received here.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {messages.map((message) =>
            message.system ? (
              <li
                key={message.id}
                className="text-ash text-caption self-center font-mono"
              >
                {message.content}
              </li>
            ) : (
              <li
                key={message.id}
                className={clsx(
                  "grid max-w-4/5 gap-0.5",
                  message.received
                    ? "self-start"
                    : "justify-items-end self-end",
                  message.delivery === MessageDelivery.PENDING && "opacity-60",
                )}
              >
                <time className="text-ash text-caption font-mono">
                  {formatClockTime(message.timestamp)}
                </time>
                {message.file ? (
                  <FileAttachment
                    file={message.file}
                    isReceived={message.received}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(message.content)}
                    className={clsx(
                      "max-w-full cursor-pointer border px-3 py-2 text-left text-base leading-snug wrap-anywhere",
                      message.received ? "border-cream" : "border-moon",
                    )}
                  >
                    {message.content}
                  </button>
                )}
                {message.delivery === MessageDelivery.FAILED && (
                  <span className="text-alert text-caption font-mono">
                    Not delivered
                  </span>
                )}
              </li>
            ),
          )}
        </ol>
      )}
    </div>
  );
}
