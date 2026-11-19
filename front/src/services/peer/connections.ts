import { env } from "@/env";
import { signalSchema } from "@/schemas/signal.schema";
import { failMessagesPendingOn } from "@/services/peer/chatMessenger";
import { abortReceiving } from "@/services/peer/fileReceiver";
import { cancelSendTo } from "@/services/peer/fileSender";
import { handleIncomingData } from "@/services/peer/incomingData";
import { sendPeerMessage } from "@/services/peer/peerChannel";
import { requestRelayToken } from "@/services/peer/relayAccess";
import { openRelayChannel } from "@/services/peer/relayChannel";
import {
  createRelayKeyPair,
  deriveRelayCipher,
  exportRelayPublicKey,
} from "@/services/peer/relayCipher";
import { SELF_PEER_ID } from "@/services/peer/selfPeer";
import { sendSignal } from "@/services/socketService";
import { findTargetPeer, usePeersStore } from "@/stores/usePeersStore";
import type { TPeerChannel } from "@/types/peerChannel.t";
import { PeerMessageType } from "@/types/peerMessage.t";
import { describeDevice } from "@/utils/device.utils";
import { createRandomId } from "@/utils/random.utils";

interface PeerLink {
  linkId: string;
  keyPair: Promise<CryptoKeyPair>;
  token: Promise<string>;
  channel: TPeerChannel | null;
  unopenedPings: number;
}

const UNOPENED_PINGS_BEFORE_RETRY = 2;

const links = new Map<string, PeerLink>();

const isInitiator = (peerId: string): boolean => SELF_PEER_ID < peerId;

export const cancelTransfersWith = (peerId: string): void => {
  cancelSendTo(peerId);
  abortReceiving(peerId);
};

export const closeConnectionTo = (peerId: string): void => {
  const link = links.get(peerId);
  if (!link) {
    return;
  }
  links.delete(peerId);
  if (link.channel) {
    link.channel.close();
    failMessagesPendingOn(link.channel);
  }
  cancelTransfersWith(peerId);
  usePeersStore
    .getState()
    .updatePeer(peerId, { channel: null, isReachable: false });
};

export const closeAllConnections = (): void => {
  [...links.keys()].forEach(closeConnectionTo);
};

const sendHello = (channel: TPeerChannel): void => {
  sendPeerMessage(channel, {
    type: PeerMessageType.HELLO,
    device: describeDevice(navigator.userAgent, navigator.maxTouchPoints),
  });
};

const failLink = (peerId: string, link: PeerLink): void => {
  if (links.get(peerId) !== link) {
    return;
  }
  closeConnectionTo(peerId);
  if (findTargetPeer(peerId)) {
    connectTo(peerId);
  }
};

const attachChannel = (
  peerId: string,
  link: PeerLink,
  channel: TPeerChannel,
): void => {
  link.channel = channel;
  channel.onOpen(() => {
    if (links.get(peerId) !== link) {
      return;
    }
    usePeersStore.getState().updatePeer(peerId, { channel, isReachable: true });
    sendHello(channel);
  });
  channel.onMessage((data) => handleIncomingData(data, peerId, channel));
  channel.onClose(() => failLink(peerId, link));
};

const sendPublicKey = async (peerId: string, link: PeerLink): Promise<void> => {
  try {
    const publicKey = await exportRelayPublicKey(link.keyPair);
    if (links.get(peerId) === link) {
      sendSignal(peerId, { linkId: link.linkId, publicKey });
    }
  } catch {
    if (links.get(peerId) === link) {
      closeConnectionTo(peerId);
    }
  }
};

const createLink = (peerId: string, linkId: string): PeerLink => {
  const link: PeerLink = {
    linkId,
    keyPair: createRelayKeyPair(),
    token: requestRelayToken(),
    channel: null,
    unopenedPings: 0,
  };
  links.set(peerId, link);
  void sendPublicKey(peerId, link);
  return link;
};

const joinRelay = async (
  peerId: string,
  link: PeerLink,
  peerPublicKey: number[],
): Promise<void> => {
  const token = await link.token;
  if (links.get(peerId) !== link || link.channel) {
    return;
  }
  attachChannel(
    peerId,
    link,
    openRelayChannel(
      env.NEXT_PUBLIC_RELAY_URL,
      { linkId: link.linkId, token },
      deriveRelayCipher(
        link.keyPair,
        peerPublicKey,
        link.linkId,
        isInitiator(peerId),
      ),
    ),
  );
};

export const connectTo = (peerId: string): void => {
  if (links.has(peerId) || !isInitiator(peerId)) {
    return;
  }
  createLink(peerId, createRandomId());
};

export const connectToMissingPeers = (): void => {
  usePeersStore
    .getState()
    .targetPeers.forEach(({ peerId }) => connectTo(peerId));
};

// a key left unanswered, or a relay socket whose pair never comes, fires no event
export const retryStalledLinks = (): void => {
  [...links].forEach(([peerId, link]) => {
    if (!isInitiator(peerId) || link.channel?.isOpen()) {
      return;
    }
    link.unopenedPings += 1;
    if (link.unopenedPings >= UNOPENED_PINGS_BEFORE_RETRY) {
      failLink(peerId, link);
    }
  });
  connectToMissingPeers();
};

export const handleSignal = (peerId: string, payload: unknown): void => {
  const signal = signalSchema.safeParse(payload);
  if (!signal.success || !findTargetPeer(peerId)) {
    return;
  }
  const { linkId, publicKey } = signal.data;

  if (!isInitiator(peerId)) {
    closeConnectionTo(peerId);
    void joinRelay(peerId, createLink(peerId, linkId), publicKey);
    return;
  }
  const link = links.get(peerId);
  if (link?.linkId === linkId) {
    void joinRelay(peerId, link, publicKey);
  }
};
