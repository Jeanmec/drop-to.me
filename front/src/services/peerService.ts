import { usePeersStore } from "@/stores/usePeersStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/message.t";
import Peer, { type DataConnection } from "peerjs";

export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  data: Blob;
}

type OnFileReceivedCallback = (file: ReceivedFile) => void;
type OnMessageReceivedCallback = (message: Message) => void;

let peerInstance: Peer | null = null;

const onFileReceivedCallbacks = new Map<string, OnFileReceivedCallback>();
const onMessageReceivedCallbacks = new Map<string, OnMessageReceivedCallback>();
const pendingAcks = new Map<string, { peerId: string; timestamp: number }>();

export const createPeerInstance = (): Peer => {
  if (peerInstance && !peerInstance.destroyed) {
    return peerInstance;
  }

  const peerUrl = new URL(process.env.NEXT_PUBLIC_PEERJS_URL!);
  const isSecure = peerUrl.protocol === "https:";

  const port = peerUrl.port ? Number(peerUrl.port) : isSecure ? 443 : 9000;

  const newPeer = new Peer({
    host: peerUrl.hostname,
    port: port,
    path: "/",
    secure: isSecure,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    },
  });

  peerInstance = newPeer;
  return newPeer;
};

export const setPeerInstance = (peer: Peer) => {
  peerInstance = peer;
};

export const getPeerInstance = () => peerInstance;

export const getPeerId = () => peerInstance?.id;

export const isPeerOpen = () => !!peerInstance?.open;

export const connectToPeer = (peerId: string): DataConnection | null => {
  if (!peerInstance || !peerInstance.open) {
    return null;
  }
  return peerInstance.connect(peerId);
};

export const destroyPeerInstance = () => {
  if (peerInstance && !peerInstance.destroyed) {
    peerInstance.destroy();
    peerInstance = null;
  }
};

// === Callbacks ===

export const setOnFileReceivedCallback = (
  callback: OnFileReceivedCallback,
  id = "default",
) => {
  onFileReceivedCallbacks.set(id, callback);
};

export const setOnMessageReceivedCallback = (
  callback: OnMessageReceivedCallback,
  id = "default",
) => {
  onMessageReceivedCallbacks.set(id, callback);
};

// === Helper functions ===

const getConnectionByPeerId = (peerId: string): DataConnection | undefined => {
  const peer = usePeersStore
    .getState()
    .targetPeers.find((p) => p.peerId === peerId);
  return peer?.connection ?? undefined;
};

const generateMessageId = (content: string): string => {
  return `${content}-${Date.now()}`;
};

// === Data handling ===

export const handleIncomingData = (data: unknown, peerId: string): void => {
  const conn = getConnectionByPeerId(peerId);

  if (!data || typeof data !== "object") {
    return;
  }

  const typedData = data as { type?: string };

  // Gestion des fichiers
  if (typedData.type === "file") {
    const fileData = data as {
      type: "file";
      fileId: string;
      name: string;
      size: number;
      content: Uint8Array | ArrayBuffer;
    };

    if (
      fileData.fileId &&
      fileData.name &&
      fileData.size &&
      (fileData.content instanceof Uint8Array ||
        fileData.content instanceof ArrayBuffer)
    ) {
      const blob = new Blob([fileData.content as BlobPart]);

      const receivedFile: ReceivedFile = {
        id: fileData.fileId,
        name: fileData.name,
        data: blob,
        size: fileData.size,
      };
      onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
      void conn?.send({ type: "ack", ackId: fileData.fileId });
      return;
    }
  }

  if (typedData.type === "message") {
    const messageData = data as {
      type: "message";
      ackId: string;
      received: boolean;
      content: string;
    };

    if (messageData.ackId && messageData.content) {
      const receivedMessage: Message = {
        received: true,
        content: messageData.content,
        timestamp: new Date(),
      };
      onMessageReceivedCallbacks.forEach((cb) => cb(receivedMessage));
      void conn?.send({ type: "ack", ackId: messageData.ackId });
      useChatStore.getState().addMessage(receivedMessage);
      return;
    }
  }

  // Gestion des ACKs
  if (typedData.type === "ack") {
    const ackData = data as { type: "ack"; ackId: string };

    if (ackData.ackId) {
      const ackInfo = pendingAcks.get(ackData.ackId);
      if (ackInfo) {
        usePeersStore
          .getState()
          .updatePeer(ackInfo.peerId, { state: "connected" });

        pendingAcks.delete(ackData.ackId);
      }
      return;
    }
  }
};

export const sendFileToTargets = async (file: File): Promise<void> => {
  const { targetPeers } = usePeersStore.getState();

  if (targetPeers.length === 0) {
    return;
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  for (const target of targetPeers) {
    const conn = target.connection;
    if (!conn?.open) {
      continue;
    }

    usePeersStore.getState().updatePeer(target.peerId, { state: "sending" });

    const fileId = `${target.peerId}-${Date.now()}`;
    const payload = {
      fileId,
      type: "file" as const,
      name: file.name,
      size: file.size,
      content: buffer,
    };

    try {
      pendingAcks.set(fileId, {
        peerId: target.peerId,
        timestamp: Date.now(),
      });
      void conn.send(payload);
    } catch (err) {
      console.error(err);
    }
  }
};

export const sendMessageToTargets = async (content: string): Promise<void> => {
  const { targetPeers } = usePeersStore.getState();

  if (targetPeers.length === 0) {
    return;
  }

  for (const target of targetPeers) {
    const conn = target.connection;
    if (!conn?.open) {
      continue;
    }

    const ackId = generateMessageId(content);
    const payload = {
      type: "message" as const,
      ackId,
      received: false,
      content,
    };

    try {
      pendingAcks.set(ackId, {
        peerId: target.peerId,
        timestamp: Date.now(),
      });
      void conn.send(payload);
    } catch (err) {
      console.error(err);
    }
  }
};
