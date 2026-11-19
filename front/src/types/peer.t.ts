import type { TDevice } from "@/schemas/device.schema";
import type { TPeerChannel } from "@/types/peerChannel.t";

export type TPeer = {
  peerId: string;
  channel: TPeerChannel | null;
  isReachable: boolean;
  isChoosingFile: boolean;
  isSending: boolean;
  isReceiving: boolean;
  device?: TDevice;
  // whole percent acknowledged by this peer; 100 only once it confirmed the complete file
  sendProgress?: number;
};
