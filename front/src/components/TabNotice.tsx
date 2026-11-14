"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useReceivedFilesStore } from "@/stores/useReceivedFilesStore";

const SITE_TITLE = "Drop to me | Peer to peer transfer";

export default function TabNotice() {
  const unreadCount = useChatStore((state) => state.unreadCount);
  const hasReceivedFile = useReceivedFilesStore(
    (state) => state.fileToastIds.length > 0,
  );
  const hasNotice = unreadCount > 0 || hasReceivedFile;

  return (
    <>
      <title>
        {unreadCount > 0 ? `(${unreadCount}) ${SITE_TITLE}` : SITE_TITLE}
      </title>
      <link
        rel="icon"
        type="image/svg+xml"
        href={hasNotice ? "/favicon-notice.svg" : "/favicon.svg"}
      />
    </>
  );
}
