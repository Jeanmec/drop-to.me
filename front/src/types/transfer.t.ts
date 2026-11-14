export enum TransferPhase {
  IDLE = "IDLE",
  ZIPPING = "ZIPPING",
  WAITING = "WAITING",
  SENDING = "SENDING",
  DONE = "DONE",
}

export type TSendProgress = {
  progress: number;
  remainingSeconds: number | null;
  isLong: boolean;
};
