import type { Message, MessageDelivery } from "@/types/message.t";
import { create } from "zustand";

let messageCounter = 0;

const HISTORY_KEY_PREFIX = "drop-to-me:chat:";

interface StoredMessage {
  id: string;
  received: boolean;
  content: string;
  timestamp: string;
  system?: boolean;
  delivery?: MessageDelivery;
}

const isMessageDelivery = (value: unknown): value is MessageDelivery =>
  value === "pending" || value === "delivered" || value === "failed";

const isStoredMessage = (value: unknown): value is StoredMessage =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "received" in value &&
  typeof value.received === "boolean" &&
  "content" in value &&
  typeof value.content === "string" &&
  "timestamp" in value &&
  typeof value.timestamp === "string" &&
  (!("delivery" in value) || isMessageDelivery(value.delivery));

const readHistory = (roomKey: string): Message[] => {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY_PREFIX + roomKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isStoredMessage).map(
      (message): Message => ({
        ...message,
        timestamp: new Date(message.timestamp),
        // a pending message read back from storage has lost the acknowledgement that would confirm it
        delivery: message.delivery === "pending" ? "failed" : message.delivery,
      }),
    );
  } catch {
    return [];
  }
};

const writeHistory = (roomKey: string | null, messages: Message[]) => {
  if (!roomKey) {
    return;
  }
  const stored: StoredMessage[] = messages
    .filter((message) => !message.file)
    .map(({ id, received, content, timestamp, system, delivery }) => ({
      id,
      received,
      content,
      timestamp: timestamp.toISOString(),
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

interface ChatStore {
  roomKey: string | null;
  messages: Message[] | null;
  unreadCount: number;
  isChatOpen: boolean;
  openRoom: (roomKey: string) => void;
  addMessage: (message: Omit<Message, "id">) => string;
  setMessageDelivery: (id: string, delivery: MessageDelivery) => void;
  setChatOpen: (open: boolean) => void;
  closeChat: () => void;
  markChatRead: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  roomKey: null,
  messages: null,
  unreadCount: 0,
  isChatOpen: false,
  openRoom: (roomKey) =>
    set({ roomKey, messages: readHistory(roomKey), unreadCount: 0 }),
  addMessage: (message) => {
    const id = `msg-${Date.now()}-${++messageCounter}`;
    set((state) => {
      const entry = { ...message, id };
      const isUnread =
        message.received === true &&
        !message.system &&
        (!state.isChatOpen || document.visibilityState !== "visible");
      const messages = state.messages ? [...state.messages, entry] : [entry];
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
      if (!state.messages) {
        return state;
      }
      const messages = state.messages.map((message) =>
        message.id === id ? { ...message, delivery } : message,
      );
      writeHistory(state.roomKey, messages);
      return { messages };
    }),
  setChatOpen: (open) =>
    set((state) => ({
      isChatOpen: open,
      unreadCount: open ? 0 : state.unreadCount,
    })),
  closeChat: () => set({ isChatOpen: false }),
  markChatRead: () => set({ unreadCount: 0 }),
}));
