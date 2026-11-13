import type { DataConnection } from "peerjs";
import type { ToastId } from "@/library/toastService";

export type TReceivingFile = {
  fileId: string;
  name: string;
  size: number;
  receivedBytes: number;
  chunks: ArrayBuffer[];
  blobs: Blob[];
  toastId?: ToastId;
};

export type TDevice = {
  name: string;
  browser: string;
  system: string;
};

export type TPeer = {
  peerId: string;
  connection: DataConnection | null;
  isReachable: boolean;
  isSending: boolean;
  isReceiving: boolean;
  receivingFile?: TReceivingFile;
  device?: TDevice;
  // whole percent acknowledged by this peer; 100 only once it confirmed the complete file
  sendProgress?: number;
};
