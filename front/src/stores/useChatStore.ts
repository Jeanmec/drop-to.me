import { create } from "zustand";
import {
  storedHistorySchema,
  storedMessageSchema,
} from "@/schemas/chatHistory.schema";
import {
  MessageDelivery,
  type TMessage,
  type TNewMessage,
} from "@/types/message.t";

const HISTORY_KEY_PREFIX = "drop-to-me:chat:";

let addedMessageCount = 0;

const readHistory = (roomKey: string): TMessage[] => {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(HISTORY_KEY_PREFIX + roomKey) ?? "[]",
    );

    return storedHistorySchema.parse(stored).flatMap((entry) => {
      const message = storedMessageSchema.safeParse(entry);
      if (!message.success) {
        return [];
      }
      // a pending message read back from storage has lost the acknowledgement that would confirm it
      const delivery =
        message.data.delivery === MessageDelivery.PENDING
          ? MessageDelivery.FAILED
          : message.data.delivery;
      return [{ ...message.data, delivery }];
    });
  } catch {
    return [];
  }
};

const writeHistory = (roomKey: string | null, messages: TMessage[]): void => {
  if (!roomKey) {
    return;
  }
  const stored = messages
    .filter((message) => !message.file)
    .map(({ id, received, content, timestamp, system, delivery }) => ({
      id,
      received,
      content,
      timestamp,
      system,
      delivery,
    }));
  try {
    sessionStorage.setItem(
      HISTORY_KEY_PREFIX + roomKey,
      JSON.stringify(stored),
    );
  } catch {
    return;
  }
};

const revokeFileUrls = (messages: TMessage[]): void => {
  messages.forEach((message) => {
    if (message.file?.fileUrl) {
      URL.revokeObjectURL(message.file.fileUrl);
    }
  });
};

interface ChatStore {
  roomKey: string | null;
  messages: TMessage[];
  unreadCount: number;
  isChatOpen: boolean;
  openRoom: (roomKey: string) => void;
  addMessage: (message: TNewMessage) => string;
  setMessageDelivery: (id: string, delivery: MessageDelivery) => void;
  openChat: () => void;
  closeChat: () => void;
  markChatRead: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  roomKey: null,
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  openRoom: (roomKey) => {
    revokeFileUrls(get().messages);
    set({ roomKey, messages: readHistory(roomKey), unreadCount: 0 });
  },

  addMessage: (message) => {
    addedMessageCount += 1;
    const id = `msg-${Date.now()}-${addedMessageCount}`;

    set((state) => {
      const isUnread =
        message.received &&
        !message.system &&
        (!state.isChatOpen || document.hidden);
      const messages = [
        ...state.messages,
        { ...message, id, timestamp: new Date() },
      ];
      writeHistory(state.roomKey, messages);
      return {
        messages,
        unreadCount: state.unreadCount + (isUnread ? 1 : 0),
      };
    });
    return id;
  },

  setMessageDelivery: (id, delivery) =>
    set((state) => {
      const messages = state.messages.map((message) =>
        message.id === id ? { ...message, delivery } : message,
      );
      writeHistory(state.roomKey, messages);
      return { messages };
    }),

  openChat: () => set({ isChatOpen: true, unreadCount: 0 }),
  closeChat: () => set({ isChatOpen: false }),
  markChatRead: () => set({ unreadCount: 0 }),
}));

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const { isChatOpen, markChatRead } = useChatStore.getState();
    if (isChatOpen && !document.hidden) {
      markChatRead();
    }
  });
}
