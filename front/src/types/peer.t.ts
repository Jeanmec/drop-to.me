import type { DataConnection } from "peerjs";
import type { ToastId } from "@/library/toastService";

export type PeerState = "connected" | "disconnected" | "sending" | "receiving";

export type TPeer = {
  peerId: string;
  connection: DataConnection | null;
  state: "connected" | "sending" | "receiving";
  receivingFile?: {
    fileId: string;
    name: string;
    size: number;
    totalChunks: number;
    receivedChunks: Uint8Array[];
    receivedCount: number;
    toastId?: ToastId;
  };
};
