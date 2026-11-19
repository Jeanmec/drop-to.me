import { RelayNotice, type TRelayJoin } from "@droptome/shared";
import type { RelayCipher } from "@/services/peer/relayCipher";
import type { TPeerChannel } from "@/types/peerChannel.t";

export const openRelayChannel = (
  relayUrl: string,
  join: TRelayJoin,
  cipher: Promise<RelayCipher>,
): TPeerChannel => {
  const socket = new WebSocket(relayUrl);
  const openListeners = new Set<() => void>();
  const closeListeners = new Set<() => void>();
  const messageListeners = new Set<(data: unknown) => void>();
  let isPaired = false;
  let hasCipher = false;
  let sending = Promise.resolve();
  let receiving = Promise.resolve();

  const isOpen = (): boolean =>
    socket.readyState === WebSocket.OPEN && isPaired && hasCipher;

  const close = (): void => socket.close();

  const announceIfOpen = (): void => {
    if (isOpen()) {
      openListeners.forEach((listener) => listener());
    }
  };

  const encryptAndSend = async (
    data: string | Uint8Array<ArrayBuffer>,
  ): Promise<void> => {
    socket.send(await (await cipher).encrypt(data));
  };

  const queueSend = (data: string | Uint8Array<ArrayBuffer>): void => {
    sending = sending.then(() => encryptAndSend(data)).catch(close);
  };

  const decryptAndDeliver = async (frame: ArrayBuffer): Promise<void> => {
    const data = await (await cipher).decrypt(frame);
    if (socket.readyState === WebSocket.OPEN) {
      messageListeners.forEach((listener) => listener(data));
    }
  };

  socket.binaryType = "arraybuffer";
  socket.addEventListener("open", () => socket.send(JSON.stringify(join)));
  socket.addEventListener("close", () =>
    closeListeners.forEach((listener) => listener()),
  );
  socket.addEventListener("message", ({ data }) => {
    if (isPaired && data instanceof ArrayBuffer) {
      receiving = receiving.then(() => decryptAndDeliver(data)).catch(close);
    } else if (!isPaired && data === RelayNotice.PAIRED) {
      isPaired = true;
      announceIfOpen();
    } else {
      close();
    }
  });
  cipher.then(() => {
    hasCipher = true;
    announceIfOpen();
  }, close);

  return {
    isOpen,
    sendText: queueSend,
    sendBytes: queueSend,
    close,
    onOpen: (listener) => openListeners.add(listener),
    onMessage: (listener) => messageListeners.add(listener),
    onClose: (listener) => closeListeners.add(listener),
    offClose: (listener) => closeListeners.delete(listener),
  };
};
