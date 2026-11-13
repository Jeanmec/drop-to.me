"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { Icon } from "../../Icons/Icon";
import Pennon from "@/components/ui/Pennon";
import Seamark from "@/components/ui/Seamark";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { useChatStore } from "@/stores/useChatStore";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useUnreadTabNotice } from "@/hooks/useUnreadTabNotice";
import styles from "./Chat.module.css";

interface ChatProps {
  isBuoyStowed: boolean;
}

export function Chat({ isBuoyStowed }: ChatProps) {
  const { isChatOpen, setChatOpen, closeChat, unreadCount } = useChatStore();
  const { isDragFileActive } = useDragFileStore();
  useOverlayClose(isChatOpen, closeChat);
  useUnreadTabNotice();

  const unreadLabel =
    unreadCount === 1 ? "1 unread message" : `${unreadCount} unread messages`;

  return (
    <>
      <span role="status" className="sr-only">
        {unreadCount > 0 ? unreadLabel : ""}
      </span>
      {!isChatOpen && !isDragFileActive && !isBuoyStowed && (
        <button
          type="button"
          aria-label={
            unreadCount > 0 ? `Open chat, ${unreadLabel}` : "Open chat"
          }
          className="group absolute right-7 bottom-4 block cursor-pointer text-left max-md:right-3 max-md:bottom-3"
          onClick={() => setChatOpen(true)}
        >
          <Seamark isOffbeat>
            <Pennon className="group-hover:text-moon text-label min-h-7.5 w-max py-1.5 pr-6 pl-2.5 font-mono leading-4.5 tracking-wider whitespace-nowrap max-md:text-xs">
              Chat
            </Pennon>
            {unreadCount > 0 && (
              <Pennon
                tone="solid"
                className="text-night text-caption mt-0.75 min-h-5.5 w-max py-0.5 pr-5 pl-2 font-mono leading-4.5 whitespace-nowrap"
              >
                {unreadCount} new
              </Pennon>
            )}
          </Seamark>
        </button>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-scrim fixed inset-0 z-40 cursor-pointer"
              onClick={closeChat}
            />
            <motion.div
              role="dialog"
              aria-label="Chat"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={styles.hoist}
            >
              <div className="flex items-center justify-between pt-1.5 pr-1.5 pb-0.5 pl-4">
                <b className="text-moon font-mono text-xs font-normal tracking-widest uppercase">
                  Chat
                </b>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={closeChat}
                  className="text-ash hover:text-moon grid size-11 cursor-pointer place-items-center"
                >
                  <Icon.close className="size-7 text-current" />
                </button>
              </div>
              <Messages />
              <MessageInput />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
