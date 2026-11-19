import type { TPeerMessage } from "@/schemas/peerMessage.schema";
import type { TPeerChannel } from "@/types/peerChannel.t";

export const sendPeerMessage = (
  channel: TPeerChannel,
  message: TPeerMessage,
): void => {
  if (channel.isOpen()) {
    channel.sendText(JSON.stringify(message));
  }
};
