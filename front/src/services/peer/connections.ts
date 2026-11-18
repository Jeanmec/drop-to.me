import { env } from "@/env";
import { signalSchema, type TSignal } from "@/schemas/signal.schema";
import { failMessagesPendingOn } from "@/services/peer/chatMessenger";
import { abortReceiving } from "@/services/peer/fileReceiver";
import { cancelSendTo } from "@/services/peer/fileSender";
import { handleIncomingData } from "@/services/peer/incomingData";
import { sendPeerMessage, wrapDataChannel } from "@/services/peer/peerChannel";
import { getRelayUrl, requestRelayToken } from "@/services/peer/relayAccess";
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
import { SignalKind } from "@/types/signal.t";
import { describeDevice } from "@/utils/device.utils";
import { createRandomId } from "@/utils/random.utils";

enum LinkRoute {
  DIRECT = "DIRECT",
  RELAY = "RELAY",
}

interface DirectLink {
  route: LinkRoute.DIRECT;
  linkId: string;
  peerConnection: RTCPeerConnection;
  channel: TPeerChannel | null;
  hasOpened: boolean;
  unopenedPings: number;
}

interface RelayedLink {
  route: LinkRoute.RELAY;
  linkId: string;
  keyPair: Promise<CryptoKeyPair>;
  channel: TPeerChannel | null;
  hasOpened: boolean;
  unopenedPings: number;
}

type PeerLink = DirectLink | RelayedLink;

const CHANNEL_LABEL = "drop-to-me";
const UNOPENED_PINGS_BEFORE_RETRY = 2;
const CONNECTED_ICE_STATES: RTCIceConnectionState[] = [
  "connected",
  "completed",
];

const links = new Map<string, PeerLink>();
const signalQueues = new Map<string, Promise<void>>();
const peersToRelay = new Set<string>();

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
  if (link.route === LinkRoute.DIRECT) {
    link.peerConnection.close();
  }
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

const updateReachability = (peerId: string, link: PeerLink): void => {
  if (links.get(peerId) !== link) {
    return;
  }
  const isReachable =
    link.channel !== null &&
    link.channel.isOpen() &&
    (link.route === LinkRoute.RELAY ||
      CONNECTED_ICE_STATES.includes(link.peerConnection.iceConnectionState));
  if (findTargetPeer(peerId)?.isReachable !== isReachable) {
    usePeersStore.getState().updatePeer(peerId, { isReachable });
  }
};

const sendHello = (channel: TPeerChannel): void => {
  sendPeerMessage(channel, {
    type: PeerMessageType.HELLO,
    device: describeDevice(navigator.userAgent, navigator.maxTouchPoints),
  });
};

const rerouteAfterFailedOpening = (peerId: string, link: PeerLink): void => {
  switch (link.route) {
    case LinkRoute.DIRECT:
      // no answer from the peer: the negotiation stalled, not the route
      if (link.peerConnection.remoteDescription) {
        peersToRelay.add(peerId);
      }
      return;
    case LinkRoute.RELAY:
      peersToRelay.delete(peerId);
      return;
  }
};

const failLink = (peerId: string, link: PeerLink): void => {
  if (links.get(peerId) !== link) {
    return;
  }
  if (!link.hasOpened) {
    rerouteAfterFailedOpening(peerId, link);
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
  const handleOpen = () => {
    if (links.get(peerId) !== link) {
      return;
    }
    link.hasOpened = true;
    usePeersStore.getState().updatePeer(peerId, { channel });
    updateReachability(peerId, link);
    sendHello(channel);
  };

  link.channel = channel;
  if (channel.isOpen()) {
    handleOpen();
  } else {
    channel.onOpen(handleOpen);
  }
  channel.onMessage((data) => handleIncomingData(data, peerId, channel));
  channel.onClose(() => failLink(peerId, link));
};

const createDirectLink = (peerId: string, linkId: string): DirectLink => {
  const link: DirectLink = {
    route: LinkRoute.DIRECT,
    linkId,
    peerConnection: new RTCPeerConnection({
      iceServers: env.NEXT_PUBLIC_STUN_URLS.map((urls) => ({ urls })),
    }),
    channel: null,
    hasOpened: false,
    unopenedPings: 0,
  };
  const { peerConnection } = link;
  links.set(peerId, link);

  peerConnection.addEventListener("icecandidate", ({ candidate }) => {
    if (candidate && links.get(peerId) === link) {
      sendSignal(peerId, {
        kind: SignalKind.CANDIDATE,
        linkId,
        candidate: candidate.toJSON(),
      });
    }
  });
  peerConnection.addEventListener("iceconnectionstatechange", () =>
    updateReachability(peerId, link),
  );
  peerConnection.addEventListener("connectionstatechange", () => {
    if (peerConnection.connectionState === "failed") {
      failLink(peerId, link);
    }
  });
  peerConnection.addEventListener("datachannel", ({ channel }) =>
    attachChannel(peerId, link, wrapDataChannel(channel)),
  );
  return link;
};

const sendOffer = async (peerId: string, link: DirectLink): Promise<void> => {
  try {
    const description = await link.peerConnection.createOffer();
    await link.peerConnection.setLocalDescription(description);
    sendSignal(peerId, {
      kind: SignalKind.DESCRIPTION,
      linkId: link.linkId,
      description,
    });
  } catch {
    if (links.get(peerId) === link) {
      closeConnectionTo(peerId);
    }
  }
};

const sendRelayKey = async (
  peerId: string,
  link: RelayedLink,
): Promise<void> => {
  try {
    const publicKey = await exportRelayPublicKey(link.keyPair);
    if (links.get(peerId) === link) {
      sendSignal(peerId, {
        kind: SignalKind.RELAY,
        linkId: link.linkId,
        publicKey,
      });
    }
  } catch {
    if (links.get(peerId) === link) {
      closeConnectionTo(peerId);
    }
  }
};

const createRelayedLink = (peerId: string, linkId: string): RelayedLink => {
  const link: RelayedLink = {
    route: LinkRoute.RELAY,
    linkId,
    keyPair: createRelayKeyPair(),
    channel: null,
    hasOpened: false,
    unopenedPings: 0,
  };
  links.set(peerId, link);
  void sendRelayKey(peerId, link);
  return link;
};

const joinRelay = async (
  peerId: string,
  link: RelayedLink,
  peerPublicKey: number[],
): Promise<void> => {
  const relayUrl = getRelayUrl();
  if (!relayUrl || link.channel) {
    return;
  }
  const token = await requestRelayToken();
  if (links.get(peerId) !== link || link.channel) {
    return;
  }
  if (!token) {
    failLink(peerId, link);
    return;
  }
  attachChannel(
    peerId,
    link,
    openRelayChannel(
      relayUrl,
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
  if (peersToRelay.has(peerId) && getRelayUrl()) {
    createRelayedLink(peerId, createRandomId());
    return;
  }
  const link = createDirectLink(peerId, createRandomId());
  attachChannel(
    peerId,
    link,
    wrapDataChannel(link.peerConnection.createDataChannel(CHANNEL_LABEL)),
  );
  void sendOffer(peerId, link);
};

export const connectToMissingPeers = (): void => {
  usePeersStore
    .getState()
    .targetPeers.forEach(({ peerId }) => connectTo(peerId));
};

// a negotiation in which a browser gathers no candidate never reaches "failed" and fires no event
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

const answerOffer = async (
  peerId: string,
  linkId: string,
  offer: RTCSessionDescriptionInit,
): Promise<void> => {
  closeConnectionTo(peerId);
  const { peerConnection } = createDirectLink(peerId, linkId);
  await peerConnection.setRemoteDescription(offer);
  const description = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(description);
  sendSignal(peerId, { kind: SignalKind.DESCRIPTION, linkId, description });
};

const acceptRelay = (
  peerId: string,
  linkId: string,
  peerPublicKey: number[],
): void => {
  if (!getRelayUrl()) {
    return;
  }
  closeConnectionTo(peerId);
  void joinRelay(peerId, createRelayedLink(peerId, linkId), peerPublicKey);
};

const findLink = (peerId: string, linkId: string): PeerLink | undefined => {
  const link = links.get(peerId);
  return link?.linkId === linkId ? link : undefined;
};

const applySignal = async (peerId: string, signal: TSignal): Promise<void> => {
  const link = findLink(peerId, signal.linkId);

  switch (signal.kind) {
    case SignalKind.DESCRIPTION:
      if (!isInitiator(peerId)) {
        await answerOffer(peerId, signal.linkId, signal.description);
      } else if (link?.route === LinkRoute.DIRECT) {
        await link.peerConnection.setRemoteDescription(signal.description);
      }
      return;
    case SignalKind.CANDIDATE:
      if (link?.route === LinkRoute.DIRECT) {
        // a candidate the engine rejects leaves the others usable
        await link.peerConnection
          .addIceCandidate(signal.candidate)
          .catch(() => undefined);
      }
      return;
    case SignalKind.RELAY:
      if (!isInitiator(peerId)) {
        acceptRelay(peerId, signal.linkId, signal.publicKey);
      } else if (link?.route === LinkRoute.RELAY) {
        void joinRelay(peerId, link, signal.publicKey);
      }
      return;
  }
};

// a peer's signals apply in order: its candidates must not overtake the offer they belong to
export const handleSignal = (peerId: string, payload: unknown): void => {
  const signal = signalSchema.safeParse(payload);
  if (!signal.success || !findTargetPeer(peerId)) {
    return;
  }
  const queue = (signalQueues.get(peerId) ?? Promise.resolve())
    .then(() => applySignal(peerId, signal.data))
    .catch(() => {
      const link = findLink(peerId, signal.data.linkId);
      if (link) {
        failLink(peerId, link);
      }
    });
  signalQueues.set(peerId, queue);
};
