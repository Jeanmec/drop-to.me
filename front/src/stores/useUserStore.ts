import { create } from "zustand";

interface UserStore {
  ip: string | null;
  setIp: (ip: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  ip: null,
  setIp: (ip) => set({ ip }),
}));
