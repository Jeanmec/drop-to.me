import type { TPeerMessage } from "@/schemas/peerMessage.schema";

export const isChannelOpen = (channel: RTCDataChannel): boolean =>
  channel.readyState === "open";

export const sendPeerMessage = (
  channel: RTCDataChannel,
  message: TPeerMessage,
): void => {
  if (isChannelOpen(channel)) {
    channel.send(JSON.stringify(message));
  }
};
