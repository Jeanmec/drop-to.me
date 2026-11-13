export interface ToastFileTransfer {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export type TTransferPhase = "idle" | "drag" | "waiting" | "sending" | "done";
