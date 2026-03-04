import type { Message } from "@/types/message.t";
import { create } from "zustand";

let messageCounter = 0;

interface ChatStore {
  messages: Message[] | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Omit<Message, "id">) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: state.messages
        ? [...state.messages, { ...message, id: `msg-${Date.now()}-${++messageCounter}` }]
        : [{ ...message, id: `msg-${Date.now()}-${++messageCounter}` }],
    })),
}));
