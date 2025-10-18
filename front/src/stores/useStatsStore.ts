import { create } from "zustand";
import type { TStatistics } from "@/types/statistics.t";

interface StatsStore {
  statistics: TStatistics;
  setStatistics: (statistics: TStatistics) => void;
  updateMessageCount: (count: number) => void;
  updateUserCount: (count: number) => void;
  updateFileStats: (count: number, size: number) => void;
}

const DEFAULT_STATISTICS: TStatistics = {
  totalTransfers: 0,
  sizeTransferred: 0,
  users: 0,
  messagesSent: 0,
};

export const useStatsStore = create<StatsStore>((set) => ({
  statistics: DEFAULT_STATISTICS,

  setStatistics: (statistics) => set({ statistics }),

  updateMessageCount: (count) =>
    set((state) => ({
      statistics: { ...state.statistics, messagesSent: count },
    })),

  updateUserCount: (count) =>
    set((state) => ({
      statistics: { ...state.statistics, users: count },
    })),

  updateFileStats: (count, size) =>
    set((state) => ({
      statistics: {
        ...state.statistics,
        totalTransfers: count,
        sizeTransferred: size,
      },
    })),
}));
