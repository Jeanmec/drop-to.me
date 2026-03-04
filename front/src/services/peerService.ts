import { usePeersStore } from "@/stores/usePeersStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/message.t";
import type { TPeer } from "@/types/peer.t";
import Peer, { type DataConnection } from "peerjs";
import { notify, type ToastId } from "@/library/toastService";

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

const PENDING_ACK_TIMEOUT_MS = 30_000;

const pendingStartAcks = new Map<
  string,
  {
    peerId: string;
    resolve: (result: boolean) => void;
    timeoutId: NodeJS.Timeout;
  }
>();

const activeSendTransfers = new Map<
  string,
  {
    fileId: string;
    fileName: string;
    toastId?: ToastId;
  }
>();

let pendingAckCleanupInterval: ReturnType<typeof setInterval> | null = null;

function startPendingAckCleanup() {
  if (pendingAckCleanupInterval) return;
  pendingAckCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ackId, info] of pendingAcks) {
      if (now - info.timestamp > PENDING_ACK_TIMEOUT_MS) {
        pendingAcks.delete(ackId);
      }
    }
  }, 10_000);
}

function stopPendingAckCleanup() {
  if (pendingAckCleanupInterval) {
    clearInterval(pendingAckCleanupInterval);
    pendingAckCleanupInterval = null;
  }
}

export const createPeerInstance = (): Peer => {
  if (peerInstance && !peerInstance.destroyed) {
    return peerInstance;
  }

  const rawUrl = process.env.NEXT_PUBLIC_PEERJS_URL;
  if (!rawUrl) {
    throw new Error("NEXT_PUBLIC_PEERJS_URL is not defined");
  }
  const peerUrl = new URL(rawUrl);
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
  return peerInstance.connect(peerId, { reliable: true });
};

export const destroyPeerInstance = () => {
  if (peerInstance && !peerInstance.destroyed) {
    peerInstance.destroy();
  }
  peerInstance = null;
  onFileReceivedCallbacks.clear();
  onMessageReceivedCallbacks.clear();
  pendingAcks.clear();
  for (const [, pending] of pendingStartAcks) {
    clearTimeout(pending.timeoutId);
  }
  pendingStartAcks.clear();
  activeSendTransfers.clear();
  stopPendingAckCleanup();
};

export const setOnFileReceivedCallback = (
  callback: OnFileReceivedCallback,
  id = "default",
) => {
  onFileReceivedCallbacks.set(id, callback);
};

export const removeOnFileReceivedCallback = (id = "default") => {
  onFileReceivedCallbacks.delete(id);
};

export const setOnMessageReceivedCallback = (
  callback: OnMessageReceivedCallback,
  id = "default",
) => {
  onMessageReceivedCallbacks.set(id, callback);
};

export const removeOnMessageReceivedCallback = (id = "default") => {
  onMessageReceivedCallbacks.delete(id);
};

export const cancelTransfersForPeer = (peerId: string): void => {
  const sendTransfer = activeSendTransfers.get(peerId);
  if (sendTransfer) {
    updateToastFailed(sendTransfer.toastId, sendTransfer.fileName, true);
    activeSendTransfers.delete(peerId);
  }

  Array.from(pendingStartAcks.entries()).forEach(([fileId, pending]) => {
    if (pending.peerId === peerId) {
      resolvePendingStartAck(fileId, false);
    }
  });

  const peer = usePeersStore
    .getState()
    .targetPeers.find((p) => p.peerId === peerId);
  if (peer?.receivingFile) {
    updateToastFailed(
      peer.receivingFile.toastId,
      peer.receivingFile.name,
      false,
    );
    usePeersStore.getState().updatePeer(peerId, { receivingFile: undefined });
  }
};

export const cancelAllSendTransfers = (): void => {
  if (activeSendTransfers.size === 0) return;

  activeSendTransfers.forEach((transfer) => {
    updateToastFailed(transfer.toastId, transfer.fileName, true);
  });
  activeSendTransfers.clear();

  Array.from(pendingStartAcks.keys()).forEach((fileId) => {
    resolvePendingStartAck(fileId, false);
  });
};

const getConnectionByPeerId = (peerId: string): DataConnection | undefined => {
  const peer = usePeersStore
    .getState()
    .targetPeers.find((p) => p.peerId === peerId);
  return peer?.connection ?? undefined;
};

const generateMessageId = (content: string): string => {
  return `${content}-${Date.now()}`;
};

const resolvePendingStartAck = (fileId: string, result: boolean): void => {
  const pending = pendingStartAcks.get(fileId);
  if (!pending) {
    return;
  }

  clearTimeout(pending.timeoutId);
  pendingStartAcks.delete(fileId);
  pending.resolve(result);
};

const waitForStartAck = (
  fileId: string,
  peerId: string,
  timeout = 10000,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      if (pendingStartAcks.has(fileId)) {
        pendingStartAcks.delete(fileId);
      }
      resolve(false);
    }, timeout);

    pendingStartAcks.set(fileId, {
      peerId,
      timeoutId,
      resolve: (result: boolean) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
    });
  });
};

export const handleIncomingData = (
  data: unknown,
  peerId: string,
  incomingConnection?: DataConnection,
): void => {
  const conn = incomingConnection ?? getConnectionByPeerId(peerId);

  const peersStore = usePeersStore.getState();
  const existingPeer = peersStore.targetPeers.find((p) => p.peerId === peerId);

  if (!existingPeer) {
    peersStore.addTargetPeer(peerId, incomingConnection);
  } else if (
    incomingConnection &&
    existingPeer.connection !== incomingConnection
  ) {
    peersStore.updatePeer(peerId, { connection: incomingConnection });
  }

  if (!data || typeof data !== "object") {
    return;
  }

  const typedData = data as { type?: string };

  if (typedData.type === "file-start-ack") {
    const startAck = data as {
      type: "file-start-ack";
      fileId: string;
    };
    resolvePendingStartAck(startAck.fileId, true);
    return;
  }

  if (typedData.type === "file-start") {
    const fileStart = data as {
      type: "file-start";
      fileId: string;
      name: string;
      size: number;
      totalChunks: number;
    };

    const toastId =
      fileStart.size > PROGRESS_TOAST_THRESHOLD
        ? notify.receivingFile(fileStart.name)
        : undefined;

    usePeersStore.getState().updatePeer(peerId, {
      state: "receiving",
      receivingFile: {
        fileId: fileStart.fileId,
        name: fileStart.name,
        size: fileStart.size,
        totalChunks: fileStart.totalChunks,
        receivedChunks: new Array(fileStart.totalChunks),
        receivedCount: 0,
        toastId,
      },
    });

    void conn?.send({
      type: "file-start-ack" as const,
      fileId: fileStart.fileId,
    });
    return;
  }

  if (typedData.type === "file-chunk") {
    const chunkData = data as {
      type: "file-chunk";
      fileId: string;
      chunkIndex: number;
      totalChunks: number;
      content: Uint8Array | ArrayBuffer;
    };

    const peer = usePeersStore
      .getState()
      .targetPeers.find((p) => p.peerId === peerId);
    const receivingFile = peer?.receivingFile;

    if (!receivingFile || receivingFile.fileId !== chunkData.fileId) {
      console.warn("Received chunk for unknown file:", chunkData.fileId);
      return;
    }

    const content =
      chunkData.content instanceof Uint8Array
        ? chunkData.content
        : new Uint8Array(chunkData.content);

    if (!receivingFile.receivedChunks[chunkData.chunkIndex]) {
      receivingFile.receivedChunks[chunkData.chunkIndex] = content;
      receivingFile.receivedCount++;
    }

    const progress =
      (receivingFile.receivedCount / receivingFile.totalChunks) * 100;
    updateToastProgress(
      receivingFile.toastId,
      receivingFile.name,
      progress,
      false,
    );

    return;
  }

  if (typedData.type === "file-end") {
    const fileEnd = data as {
      type: "file-end";
      fileId: string;
    };

    const peer = usePeersStore
      .getState()
      .targetPeers.find((p) => p.peerId === peerId);
    const receivingFile = peer?.receivingFile;

    if (!receivingFile || receivingFile.fileId !== fileEnd.fileId) {
      console.warn("Received file-end for unknown file:", fileEnd.fileId);
      return;
    }

    if (receivingFile.receivedCount !== receivingFile.totalChunks) {
      console.error(
        `Missing chunks: ${receivingFile.receivedCount}/${receivingFile.totalChunks}`,
      );

      dismissToast(receivingFile.toastId);
      notify.error("File transfer incomplete");

      usePeersStore.getState().updatePeer(peerId, {
        state: "connected",
        receivingFile: undefined,
      });
      return;
    }

    const allChunks = receivingFile.receivedChunks.filter(
      (chunk): chunk is Uint8Array => chunk !== undefined,
    );
    const blob = new Blob(allChunks as BlobPart[]);

    const receivedFile: ReceivedFile = {
      id: fileEnd.fileId,
      name: receivingFile.name,
      data: blob,
      size: receivingFile.size,
    };

    onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
    void conn?.send({ type: "ack", ackId: fileEnd.fileId });

    dismissToast(receivingFile.toastId);

    usePeersStore.getState().updatePeer(peerId, {
      state: "connected",
      receivingFile: undefined,
    });
    return;
  }

  // Legacy format for backward compatibility
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
      const receivedMessage = {
        received: true as const,
        content: messageData.content,
        timestamp: new Date(),
      };
      onMessageReceivedCallbacks.forEach((cb) =>
        cb({ ...receivedMessage, id: messageData.ackId }),
      );
      void conn?.send({ type: "ack", ackId: messageData.ackId });
      useChatStore.getState().addMessage(receivedMessage);
      return;
    }
  }

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

const CHUNK_SIZE = 16 * 1024;
const PROGRESS_TOAST_THRESHOLD = 10 * 1024 * 1024; // Show toast only for files > 10MB

const updateToastProgress = (
  toastId: ToastId | undefined,
  fileName: string,
  progress: number,
  isUploading: boolean,
): void => {
  if (toastId) {
    notify.updateProgress(toastId, fileName, progress, isUploading);
  }
};

const dismissToast = (toastId: ToastId | undefined): void => {
  if (toastId) {
    notify.dismiss(toastId);
  }
};

const updateToastFailed = (
  toastId: ToastId | undefined,
  fileName: string,
  isUploading: boolean,
): void => {
  if (toastId) {
    notify.updateToFailed(toastId, fileName, isUploading);
  }
};

const shouldStopTransfer = (
  peerId: string,
  connection: DataConnection,
): boolean => {
  if (!activeSendTransfers.has(peerId)) {
    return true;
  }

  if (!connection.open) {
    cancelTransfersForPeer(peerId);
    return true;
  }

  return false;
};

const sendFileChunk = async (
  connection: DataConnection,
  fileChunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  fileId: string,
  peerId: string,
  toastId: ToastId | undefined,
  fileName: string,
): Promise<void> => {
  const buffer = new Uint8Array(await fileChunk.arrayBuffer());

  const chunkPayload = {
    type: "file-chunk" as const,
    fileId,
    chunkIndex,
    totalChunks,
    content: buffer,
  };

  connection.send(chunkPayload);

  if (activeSendTransfers.has(peerId)) {
    const progress = ((chunkIndex + 1) / totalChunks) * 100;
    updateToastProgress(toastId, fileName, progress, true);
  }
};

const sendFileToPeer = async (
  file: File,
  peerId: string,
  connection: DataConnection,
): Promise<boolean> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${peerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const toastId =
    file.size > PROGRESS_TOAST_THRESHOLD
      ? notify.sendingFile(file.name)
      : undefined;

  activeSendTransfers.set(peerId, {
    fileId,
    fileName: file.name,
    toastId,
  });

  try {
    connection.send({
      type: "file-start" as const,
      fileId,
      name: file.name,
      size: file.size,
      totalChunks,
    });

    const startAcked = await waitForStartAck(fileId, peerId);
    if (!startAcked) {
      if (activeSendTransfers.has(peerId)) {
        updateToastFailed(toastId, file.name, true);
        activeSendTransfers.delete(peerId);
      }
      notify.error("The recipient is not ready to receive the file.");
      return false;
    }

    let chunkIndex = 0;
    let offset = 0;

    while (offset < file.size) {
      if (shouldStopTransfer(peerId, connection)) {
        break;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      await sendFileChunk(
        connection,
        chunk,
        chunkIndex,
        totalChunks,
        fileId,
        peerId,
        toastId,
        file.name,
      );

      offset += CHUNK_SIZE;
      chunkIndex++;
    }

    if (offset < file.size) {
      if (activeSendTransfers.has(peerId)) {
        updateToastFailed(toastId, file.name, true);
        activeSendTransfers.delete(peerId);
      }
      return false;
    }

    connection.send({
      type: "file-end" as const,
      fileId,
    });

    pendingAcks.set(fileId, { peerId, timestamp: Date.now() });
    startPendingAckCleanup();

    dismissToast(toastId);
    activeSendTransfers.delete(peerId);
    return true;
  } catch (err) {
    console.error("[sendFileToPeer] Error:", err);
    dismissToast(toastId);
    activeSendTransfers.delete(peerId);
    notify.error("Failed to send file");
    return false;
  }
};

const waitForConnectionOpen = (
  connection: DataConnection,
  timeout = 10000,
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (connection.open) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      connection.off("open", onOpen);
      resolve(false);
    }, timeout);

    const onOpen = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    connection.once("open", onOpen);
  });
};

export const sendFileToTargets = async (file: File): Promise<boolean> => {
  const { targetPeers } = usePeersStore.getState();

  if (targetPeers.length === 0) {
    return false;
  }

  const connectionsReady = await Promise.all(
    targetPeers.map(async (target) => {
      if (!target.connection) return null;
      const isReady = await waitForConnectionOpen(target.connection);
      return isReady ? target : null;
    }),
  );

  const readyTargets = connectionsReady.filter(
    (target): target is TPeer => target !== null,
  );

  if (readyTargets.length === 0) {
    notify.error("No connection ready to send file");
    return false;
  }

  const results = await Promise.all(
    readyTargets.map(async (target) => {
      usePeersStore.getState().updatePeer(target.peerId, { state: "sending" });
      return sendFileToPeer(file, target.peerId, target.connection!);
    }),
  );

  return results.some((success) => success);
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
      pendingAcks.set(ackId, { peerId: target.peerId, timestamp: Date.now() });
      startPendingAckCleanup();
      void conn.send(payload);
    } catch (err) {
      console.error(err);
    }
  }
};
