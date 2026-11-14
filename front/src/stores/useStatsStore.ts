import { create } from "zustand";
import {
  StatUpdateType,
  type TStatUpdate,
  type TStatistics,
} from "@droptome/shared";

interface StatsStore {
  statistics: TStatistics;
  setStatistics: (statistics: TStatistics) => void;
  applyUpdate: (update: TStatUpdate) => void;
}

const DEFAULT_STATISTICS: TStatistics = {
  totalTransfers: 0,
  sizeTransferred: 0,
  users: 0,
  messagesSent: 0,
};

const applyStatUpdate = (
  statistics: TStatistics,
  update: TStatUpdate,
): TStatistics => {
  switch (update.type) {
    case StatUpdateType.MESSAGES:
      return { ...statistics, messagesSent: update.count };
    case StatUpdateType.USERS:
      return { ...statistics, users: update.count };
    case StatUpdateType.FILES:
      return {
        ...statistics,
        totalTransfers: update.count,
        sizeTransferred: update.size ?? statistics.sizeTransferred,
      };
  }
};

export const useStatsStore = create<StatsStore>((set) => ({
  statistics: DEFAULT_STATISTICS,

  setStatistics: (statistics) => set({ statistics }),

  applyUpdate: (update) =>
    set((state) => ({
      statistics: applyStatUpdate(state.statistics, update),
    })),
}));
