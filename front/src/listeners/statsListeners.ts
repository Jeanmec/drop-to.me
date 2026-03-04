import { onSocket, offSocket } from "@/services/socketService";
import type { TUpdateStatPayload } from "@droptome/shared";

interface InitializeStatsListenersParams {
  onUpdateStat: (data: TUpdateStatPayload) => void;
}

export const initializeStatsListeners = ({
  onUpdateStat,
}: InitializeStatsListenersParams) => {
  onSocket<TUpdateStatPayload>("update-stat", onUpdateStat);
};

export const cleanupStatsListeners = () => {
  offSocket("update-stat");
};
