import type { TPeerMessage } from "@/schemas/peerMessage.schema";
import type { TPeerChannel } from "@/types/peerChannel.t";

// bytes in flight beyond what the path can queue are dropped, and SCTP takes seconds to recover
const DATA_CHANNEL_INITIAL_SEND_WINDOW = 64 * 1024;
const DATA_CHANNEL_MAX_SEND_WINDOW = 1024 * 1024;

export const sendPeerMessage = (
  channel: TPeerChannel,
  message: TPeerMessage,
): void => {
  if (channel.isOpen()) {
    channel.sendText(JSON.stringify(message));
  }
};

export const wrapDataChannel = (dataChannel: RTCDataChannel): TPeerChannel => {
  dataChannel.binaryType = "arraybuffer";

  return {
    initialSendWindow: DATA_CHANNEL_INITIAL_SEND_WINDOW,
    maxSendWindow: DATA_CHANNEL_MAX_SEND_WINDOW,
    isOpen: () => dataChannel.readyState === "open",
    sendText: (text) => dataChannel.send(text),
    sendBytes: (bytes) => dataChannel.send(bytes),
    close: () => dataChannel.close(),
    onOpen: (listener) => dataChannel.addEventListener("open", listener),
    onMessage: (listener) =>
      dataChannel.addEventListener("message", (event) => listener(event.data)),
    onClose: (listener) => dataChannel.addEventListener("close", listener),
    offClose: (listener) => dataChannel.removeEventListener("close", listener),
  };
};
