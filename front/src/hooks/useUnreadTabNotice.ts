import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";

export function useUnreadTabNotice(): void {
  const unreadCount = useChatStore((state) => state.unreadCount);
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const markChatRead = useChatStore((state) => state.markChatRead);

  useEffect(() => {
    if (unreadCount === 0) {
      return;
    }

    const title = document.title;
    document.title = `(${unreadCount}) ${title}`;
    return () => {
      document.title = title;
    };
  }, [unreadCount]);

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markChatRead();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isChatOpen, markChatRead]);
}
