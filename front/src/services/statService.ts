import { emitSocket, getSocket } from "./socketService";
import type { TStatistics, TAddStatPayload } from "@/types/statistics.t";

class StatService {
  formatSize(size: number): { value: number; suffix: string } {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const suffix = units[unitIndex] ?? "";

    let value: number;

    if (suffix === "TB") {
      const intPart = Math.floor(size);
      const decimals = intPart <= 99 ? 1 : 0;
      value = parseFloat(size.toFixed(decimals));
    } else {
      value = parseFloat(size.toPrecision(3));
    }

    return { value, suffix };
  }

  async fetchStatistics(): Promise<TStatistics> {
    const socket = getSocket();
    if (!socket) {
      throw new Error("Socket not connected");
    }

    return new Promise((resolve, reject) => {
      socket.emit("get-stat", null, (response: TStatistics) => {
        if (response) {
          resolve(response);
        } else {
          reject(new Error("Failed to fetch statistics"));
        }
      });
    });
  }

  addMessageStat(): void {
    const payload: TAddStatPayload = { type: "message" };
    emitSocket("add-stat", payload);
  }

  addFileStat(fileSize: number): void {
    const payload: TAddStatPayload = { type: "file", fileSize };
    emitSocket("add-stat", payload);
  }
}

export const statService = new StatService();
