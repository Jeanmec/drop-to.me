export type TPeerChannel = {
  // bytes a file sender may have unacknowledged, at the start and at most
  initialSendWindow: number;
  maxSendWindow: number;
  isOpen: () => boolean;
  sendText: (text: string) => void;
  sendBytes: (bytes: Uint8Array<ArrayBuffer>) => void;
  close: () => void;
  onOpen: (listener: () => void) => void;
  onMessage: (listener: (data: unknown) => void) => void;
  onClose: (listener: () => void) => void;
  offClose: (listener: () => void) => void;
};
