import { env } from "@/env";
import { signalSchema, type TSignal } from "@/schemas/signal.schema";
import { failMessagesPendingOn } from "@/services/peer/chatMessenger";
import { abortReceiving } from "@/services/peer/fileReceiver";
import { cancelSendTo } from "@/services/peer/fileSender";
import { handleIncomingData } from "@/services/peer/incomingData";
import { isChannelOpen, sendPeerMessage } from "@/services/peer/peerChannel";
import { SELF_PEER_ID } from "@/services/peer/selfPeer";
import { sendSignal } from "@/services/socketService";
import { findTargetPeer, usePeersStore } from "@/stores/usePeersStore";
import { PeerMessageType } from "@/types/peerMessage.t";
import { SignalKind } from "@/types/signal.t";
import { describeDevice } from "@/utils/device.utils";
import { createRandomId } from "@/utils/random.utils";

interface PeerLink {
  linkId: string;
  peerConnection: RTCPeerConnection;
  channel: RTCDataChannel | null;
  unopenedPings: number;
}

const CHANNEL_LABEL = "drop-to-me";
const UNOPENED_PINGS_BEFORE_RETRY = 2;
const CONNECTED_ICE_STATES: RTCIceConnectionState[] = [
  "connected",
  "completed",
];

const links = new Map<string, PeerLink>();
const signalQueues = new Map<string, Promise<void>>();

const isInitiator = (peerId: string): boolean => SELF_PEER_ID < peerId;

const listIceServers = (): RTCIceServer[] => {
  const stunServers: RTCIceServer[] = env.NEXT_PUBLIC_STUN_URLS.map((urls) => ({
    urls,
  }));
  if (!env.NEXT_PUBLIC_TURN_URL) {
    return stunServers;
  }
  return [
    ...stunServers,
    {
      urls: env.NEXT_PUBLIC_TURN_URL,
      username: env.NEXT_PUBLIC_TURN_USERNAME,
      credential: env.NEXT_PUBLIC_TURN_CREDENTIAL,
    },
  ];
};

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
  link.peerConnection.close();
  if (link.channel) {
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
    isChannelOpen(link.channel) &&
    CONNECTED_ICE_STATES.includes(link.peerConnection.iceConnectionState);
  if (findTargetPeer(peerId)?.isReachable !== isReachable) {
    usePeersStore.getState().updatePeer(peerId, { isReachable });
  }
};

const sendHello = (channel: RTCDataChannel): void => {
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
  channel: RTCDataChannel,
): void => {
  const handleOpen = () => {
    if (links.get(peerId) !== link) {
      return;
    }
    usePeersStore.getState().updatePeer(peerId, { channel });
    updateReachability(peerId, link);
    sendHello(channel);
  };

  link.channel = channel;
  channel.binaryType = "arraybuffer";
  if (isChannelOpen(channel)) {
    handleOpen();
  } else {
    channel.addEventListener("open", handleOpen);
  }
  channel.addEventListener("message", (event) =>
    handleIncomingData(event.data, peerId, channel),
  );
  channel.addEventListener("close", () => failLink(peerId, link));
};

const createLink = (peerId: string, linkId: string): PeerLink => {
  const link: PeerLink = {
    linkId,
    peerConnection: new RTCPeerConnection({ iceServers: listIceServers() }),
    channel: null,
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
    attachChannel(peerId, link, channel),
  );
  return link;
};

const sendOffer = async (peerId: string, link: PeerLink): Promise<void> => {
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

export const connectTo = (peerId: string): void => {
  if (links.has(peerId) || !isInitiator(peerId)) {
    return;
  }
  const link = createLink(peerId, createRandomId());
  attachChannel(
    peerId,
    link,
    link.peerConnection.createDataChannel(CHANNEL_LABEL),
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
    if (!isInitiator(peerId) || (link.channel && isChannelOpen(link.channel))) {
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
  const { peerConnection } = createLink(peerId, linkId);
  await peerConnection.setRemoteDescription(offer);
  const description = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(description);
  sendSignal(peerId, { kind: SignalKind.DESCRIPTION, linkId, description });
};

const findLink = (peerId: string, linkId: string): PeerLink | undefined => {
  const link = links.get(peerId);
  return link?.linkId === linkId ? link : undefined;
};

const applySignal = async (peerId: string, signal: TSignal): Promise<void> => {
  switch (signal.kind) {
    case SignalKind.DESCRIPTION:
      if (isInitiator(peerId)) {
        await findLink(
          peerId,
          signal.linkId,
        )?.peerConnection.setRemoteDescription(signal.description);
        return;
      }
      await answerOffer(peerId, signal.linkId, signal.description);
      return;
    case SignalKind.CANDIDATE:
      // a candidate the engine rejects leaves the others usable
      await findLink(peerId, signal.linkId)
        ?.peerConnection.addIceCandidate(signal.candidate)
        .catch(() => undefined);
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
