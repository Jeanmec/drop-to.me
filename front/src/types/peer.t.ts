import type { DataConnection } from "peerjs";
import type { ToastId } from "@/library/toastService";

export type TPeer = {
  peerId: string;
  connection: DataConnection | null;
  isSending: boolean;
  isReceiving: boolean;
  receivingFile?: {
    fileId: string;
    name: string;
    size: number;
    totalChunks: number;
    receivedChunks: Uint8Array[];
    receivedCount: number;
    lastChunkAt: number;
    toastId?: ToastId;
  };
};
