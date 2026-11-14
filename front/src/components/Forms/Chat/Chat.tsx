"use client";

import clsx from "clsx";
import CloseButton from "@/components/ui/CloseButton";
import Pennon from "@/components/ui/Pennon";
import Seamark from "@/components/ui/Seamark";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useChatStore } from "@/stores/useChatStore";
import { PennonTone } from "@/types/ui.t";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

interface ChatProps {
  isBuoyStowed: boolean;
}

export default function Chat({ isBuoyStowed }: ChatProps) {
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const openChat = useChatStore((state) => state.openChat);
  const closeChat = useChatStore((state) => state.closeChat);
  useOverlayClose(isChatOpen, closeChat);

  const unreadLabel =
    unreadCount === 1 ? "1 unread message" : `${unreadCount} unread messages`;

  return (
    <>
      <span role="status" className="sr-only">
        {unreadCount > 0 ? unreadLabel : ""}
      </span>
      {!isChatOpen && !isBuoyStowed && (
        <button
          type="button"
          aria-label={
            unreadCount > 0 ? `Open chat, ${unreadLabel}` : "Open chat"
          }
          className="group absolute right-7 bottom-4 block cursor-pointer text-left max-md:right-3 max-md:bottom-3"
          onClick={openChat}
        >
          <Seamark isOffbeat signalCount={unreadCount}>
            <Pennon className="group-hover:text-moon text-label block min-h-7.5 w-max py-1.5 pr-6 pl-2.5 font-mono leading-4.5 tracking-wider whitespace-nowrap max-md:text-xs">
              Chat
            </Pennon>
            {unreadCount > 0 && (
              <Pennon
                tone={PennonTone.SIGNAL}
                className="text-night text-caption mt-0.75 block min-h-5.5 w-max py-0.5 pr-5 pl-2 font-mono leading-4.5 whitespace-nowrap"
              >
                {unreadCount} new
              </Pennon>
            )}
          </Seamark>
        </button>
      )}

      <div
        aria-hidden
        onClick={closeChat}
        className={clsx(
          "bg-scrim fixed inset-0 z-40 cursor-pointer transition-opacity duration-300",
          isChatOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div className="pointer-events-none fixed inset-y-4 right-7 left-4 z-50 flex items-end justify-end max-md:inset-3">
        <dialog
          open={isChatOpen}
          aria-label="Chat"
          className="border-cream bg-night text-cream pointer-events-auto static m-0 h-120 max-h-full w-95 max-w-full translate-y-5.5 flex-col border p-0 opacity-0 transition transition-discrete duration-350 ease-out open:flex open:translate-y-0 open:opacity-100 max-md:h-3/4 max-md:w-full starting:open:translate-y-5.5 starting:open:opacity-0"
        >
          <div className="border-cream flex items-center justify-between border-b pr-1.5 pl-4">
            <b className="text-moon font-mono text-xs font-normal tracking-widest uppercase">
              Chat
            </b>
            <CloseButton label="Close chat" onClick={closeChat} />
          </div>
          <Messages />
          <MessageInput />
        </dialog>
      </div>
    </>
  );
}
