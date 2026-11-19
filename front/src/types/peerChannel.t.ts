export type TPeerChannel = {
  isOpen: () => boolean;
  sendText: (text: string) => void;
  sendBytes: (bytes: Uint8Array<ArrayBuffer>) => void;
  close: () => void;
  onOpen: (listener: () => void) => void;
  onMessage: (listener: (data: unknown) => void) => void;
  onClose: (listener: () => void) => void;
  offClose: (listener: () => void) => void;
};
