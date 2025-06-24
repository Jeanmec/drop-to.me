import type { Message } from "@/types/message.t";
import { create } from "zustand";

interface ChatStore {
  messages: Message[] | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: state.messages ? [...state.messages, message] : [message],
    })),
}));
