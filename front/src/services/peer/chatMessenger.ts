import type { TChatMessage } from "@/schemas/peerMessage.schema";
import { sendPeerMessage } from "@/services/peer/peerChannel";
import { addMessageStat } from "@/services/statService";
import { useChatStore } from "@/stores/useChatStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { MessageDelivery } from "@/types/message.t";
import type { TPeerChannel } from "@/types/peerChannel.t";
import { PeerMessageType } from "@/types/peerMessage.t";
import { createRandomId } from "@/utils/random.utils";

interface PendingMessage {
  messageId: string;
  channels: Set<TPeerChannel>;
}

const pendingMessages = new Map<string, PendingMessage>();

export const sendMessageToTargets = (content: string): boolean => {
  const chatMessage: TChatMessage = {
    type: PeerMessageType.CHAT,
    ackId: createRandomId(),
    content,
  };
  const channels = new Set<TPeerChannel>();

  for (const target of usePeersStore.getState().targetPeers) {
    if (target.channel && target.isReachable) {
      sendPeerMessage(target.channel, chatMessage);
      channels.add(target.channel);
    }
  }

  if (channels.size === 0) {
    return false;
  }

  const messageId = useChatStore.getState().addMessage({
    received: false,
    content,
    delivery: MessageDelivery.PENDING,
  });
  pendingMessages.set(chatMessage.ackId, { messageId, channels });
  return true;
};

export const receiveChatMessage = (
  message: TChatMessage,
  channel: TPeerChannel,
): void => {
  if (!message.content) {
    return;
  }

  useChatStore
    .getState()
    .addMessage({ received: true, content: message.content });
  sendPeerMessage(channel, { type: PeerMessageType.ACK, ackId: message.ackId });
};

// false when the acknowledgement is not the one of a chat message
export const confirmMessageDelivered = (ackId: string): boolean => {
  const pendingMessage = pendingMessages.get(ackId);
  if (!pendingMessage) {
    return false;
  }

  pendingMessages.delete(ackId);
  useChatStore
    .getState()
    .setMessageDelivery(pendingMessage.messageId, MessageDelivery.DELIVERED);
  addMessageStat();
  return true;
};

export const failMessagesPendingOn = (channel: TPeerChannel): void => {
  pendingMessages.forEach((pendingMessage, ackId) => {
    if (
      pendingMessage.channels.delete(channel) &&
      pendingMessage.channels.size === 0
    ) {
      pendingMessages.delete(ackId);
      useChatStore
        .getState()
        .setMessageDelivery(pendingMessage.messageId, MessageDelivery.FAILED);
    }
  });
};
