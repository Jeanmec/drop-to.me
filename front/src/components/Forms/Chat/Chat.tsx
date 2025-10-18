"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { Icon } from "../../Icons/Icon";
import { useDragFileStore } from "@/stores/useDragFileStore";

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDragFileActive } = useDragFileStore();

  return (
    <>
      {!isOpen && !isDragFileActive && (
        <div
          className="fixed right-6 bottom-6 z-10 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="rounded-full border-2 border-slate-100/30 p-5 backdrop-blur-xs">
            <Icon.message className="text-3xl" />
          </div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
              animate={{ backdropFilter: "blur(4px)", opacity: 1 }}
              exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
              className="fixed inset-0 z-40 cursor-pointer bg-black/20"
              onClick={() => setIsOpen(false)}
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
