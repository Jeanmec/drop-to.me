import { peerMessageSchema } from "@/schemas/peerMessage.schema";
import {
  confirmMessageDelivered,
  receiveChatMessage,
} from "@/services/peer/chatMessenger";
import {
  receiveFileBytes,
  receiveFileEnd,
  receiveFileStart,
} from "@/services/peer/fileReceiver";
import {
  acknowledgeFileProgress,
  acknowledgeFileStart,
  confirmFileReceived,
} from "@/services/peer/fileSender";
import { findTargetPeer, usePeersStore } from "@/stores/usePeersStore";
import type { TPeerChannel } from "@/types/peerChannel.t";
import { PeerMessageType } from "@/types/peerMessage.t";

const readJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const handleIncomingData = (
  data: unknown,
  peerId: string,
  channel: TPeerChannel,
): void => {
  if (!findTargetPeer(peerId)) {
    return;
  }

  if (data instanceof ArrayBuffer) {
    receiveFileBytes(data, peerId, channel);
    return;
  }
  if (typeof data !== "string") {
    return;
  }

  const parsed = peerMessageSchema.safeParse(readJson(data));
  if (!parsed.success) {
    return;
  }
  const message = parsed.data;

  switch (message.type) {
    case PeerMessageType.FILE_START:
      receiveFileStart(message, peerId, channel);
      return;
    case PeerMessageType.FILE_START_ACK:
      acknowledgeFileStart(peerId, message);
      return;
    case PeerMessageType.FILE_PROGRESS:
      acknowledgeFileProgress(peerId, message);
      return;
    case PeerMessageType.FILE_END:
      receiveFileEnd(message, peerId, channel);
      return;
    case PeerMessageType.CHAT:
      receiveChatMessage(message, channel);
      return;
    case PeerMessageType.ACK:
      if (!confirmMessageDelivered(message.ackId)) {
        confirmFileReceived(message.ackId);
      }
      return;
    case PeerMessageType.HELLO:
      usePeersStore.getState().updatePeer(peerId, { device: message.device });
      return;
  }
};
