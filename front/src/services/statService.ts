import { getRequest, postRequest } from "@/library/request";
import type { TStatistics } from "@/types/statistics.t";

class StatService {
  async getStatistics(): Promise<TStatistics> {
    return await getRequest<TStatistics>("/stats");
  }

  async sendMessage(): Promise<void> {
    try {
      await postRequest("/stats/message");
    } catch (error) {
      console.error("[StatService] Erreur lors de l'envoi du message", error);
    }
  }

  async sendFile(fileSize: number): Promise<void> {
    try {
      await postRequest("/stats/file", { fileSize });
    } catch (error) {
      console.error("[StatService] Erreur lors de l'envoi du fichier", error);
    }
  }

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
}

export const statService = new StatService();
