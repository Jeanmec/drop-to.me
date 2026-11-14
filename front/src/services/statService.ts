import { SocketEvent, StatType } from "@droptome/shared";
import { getSocket } from "@/services/socketService";
import { useStatsStore } from "@/stores/useStatsStore";

const STATISTICS_TIMEOUT_MS = 10_000;

export const loadStatistics = async (): Promise<void> => {
  const socket = getSocket();
  if (!socket) {
    return;
  }

  try {
    const statistics = await socket
      .timeout(STATISTICS_TIMEOUT_MS)
      .emitWithAck(SocketEvent.GET_STAT, null);
    if (statistics) {
      useStatsStore.getState().setStatistics(statistics);
    }
  } catch {
    return;
  }
};

export const addMessageStat = (): void => {
  getSocket()?.emit(SocketEvent.ADD_STAT, { type: StatType.MESSAGE });
};

export const addFileStat = (fileSize: number): void => {
  getSocket()?.emit(SocketEvent.ADD_STAT, { type: StatType.FILE, fileSize });
};
