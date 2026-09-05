"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { Icon } from "../../Icons/Icon";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { useChatStore } from "@/stores/useChatStore";

export function Chat() {
  const { isChatOpen, setChatOpen, unreadCount } = useChatStore();
  const { isDragFileActive } = useDragFileStore();

  const unreadLabel =
    unreadCount === 1 ? "1 unread message" : `${unreadCount} unread messages`;

  return (
    <>
      <span role="status" className="sr-only">
        {unreadCount > 0 ? unreadLabel : ""}
      </span>
      {!isChatOpen && !isDragFileActive && (
        <button
          type="button"
          aria-label={
            unreadCount > 0 ? `Open chat, ${unreadLabel}` : "Open chat"
          }
          className="fixed right-6 bottom-6 z-10 cursor-pointer"
          onClick={() => setChatOpen(true)}
        >
          <div className="relative rounded-full border-2 border-slate-100/30 p-5 backdrop-blur-xs">
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="bg-secondary-blue animate-bounce-fade-in absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-full"
              />
            )}
            <Icon.message className="text-3xl" />
          </div>
        </button>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
              animate={{ backdropFilter: "blur(4px)", opacity: 1 }}
              exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
              className="fixed inset-0 z-40 cursor-pointer bg-black/20"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed z-50 overflow-hidden max-md:right-0 max-md:bottom-0 max-md:left-0 max-md:h-[75vh] max-md:w-full max-md:px-4 max-md:pb-4 md:right-4 md:bottom-4 md:h-[400px] md:w-[360px]"
            >
              <div className="border-primary-blue flex h-full w-full flex-col justify-end rounded-xl border-2 bg-gradient-to-b from-stone-900 to-stone-800 p-2">
                <Messages />
                <div className="mt-auto">
                  <MessageInput />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
