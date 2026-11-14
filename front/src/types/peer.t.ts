import type { TDevice } from "@/schemas/device.schema";

export type TPeer = {
  peerId: string;
  channel: RTCDataChannel | null;
  isReachable: boolean;
  isSending: boolean;
  isReceiving: boolean;
  device?: TDevice;
  // whole percent acknowledged by this peer; 100 only once it confirmed the complete file
  sendProgress?: number;
};
