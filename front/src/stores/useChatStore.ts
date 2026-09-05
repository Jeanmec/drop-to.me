import type { Message } from "@/types/message.t";
import { create } from "zustand";

let messageCounter = 0;

interface ChatStore {
  messages: Message[] | null;
  unreadCount: number;
  isChatOpen: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Omit<Message, "id">) => void;
  setChatOpen: (open: boolean) => void;
  markChatRead: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: null,
  unreadCount: 0,
  isChatOpen: false,
  setMessages: (messages) => set({ messages, unreadCount: 0 }),
  addMessage: (message) =>
    set((state) => {
      const entry = {
        ...message,
        id: `msg-${Date.now()}-${++messageCounter}`,
      };
      const isUnread =
        message.received === true && !message.system && !state.isChatOpen;
      return {
        messages: state.messages ? [...state.messages, entry] : [entry],
        unreadCount: state.unreadCount + (isUnread ? 1 : 0),
      };
    }),
  setChatOpen: (open) =>
    set((state) => ({
      isChatOpen: open,
      unreadCount: open ? 0 : state.unreadCount,
    })),
  markChatRead: () => set({ unreadCount: 0 }),
}));
