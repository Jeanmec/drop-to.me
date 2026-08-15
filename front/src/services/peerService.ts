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
type ProgressReporter = (peerId: string, progress: number) => void;

let peerInstance: Peer | null = null;

const onFileReceivedCallbacks = new Map<string, OnFileReceivedCallback>();
const onMessageReceivedCallbacks = new Map<string, OnMessageReceivedCallback>();
const pendingAcks = new Map<string, { peerId: string; timestamp: number }>();

const PENDING_ACK_TIMEOUT_MS = 30_000;
const RECEIVE_INACTIVITY_TIMEOUT_MS = 45_000;
const CHUNK_SIZE = 16 * 1024;
const PROGRESS_TOAST_THRESHOLD = 10 * 1024 * 1024; // 10MB
const HIGH_WATERMARK = 1 * 1024 * 1024; // 1MB
const LOW_WATERMARK = 256 * 1024; // 256KB
const START_ACK_TIMEOUT_MS = 10_000;
const START_ACK_MAX_ATTEMPTS = 3;

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
  }
>();

let pendingAckCleanupInterval: ReturnType<typeof setInterval> | null = null;
let receiveTimeoutInterval: ReturnType<typeof setInterval> | null = null;

function startBackgroundCleanups() {
  if (!pendingAckCleanupInterval) {
    pendingAckCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ackId, info] of pendingAcks) {
        if (now - info.timestamp > PENDING_ACK_TIMEOUT_MS) {
          pendingAcks.delete(ackId);
          const peer = usePeersStore
            .getState()
            .targetPeers.find((p) => p.peerId === info.peerId);
          if (peer?.isSending) {
            usePeersStore
              .getState()
              .updatePeer(info.peerId, { isSending: false });
          }
        }
      }
    }, 10_000);
  }
  if (!receiveTimeoutInterval) {
    receiveTimeoutInterval = setInterval(() => {
      const now = Date.now();
      const peers = usePeersStore.getState().targetPeers;
      peers.forEach((peer) => {
        const receiving = peer.receivingFile;
        if (
          receiving &&
          now - receiving.lastChunkAt > RECEIVE_INACTIVITY_TIMEOUT_MS
        ) {
          if (receiving.toastId) {
            notify.updateToFailed(receiving.toastId, receiving.name, false);
          }
          usePeersStore.getState().updatePeer(peer.peerId, {
            isReceiving: false,
            receivingFile: undefined,
          });
        }
      });
    }, 5_000);
  }
}

function stopBackgroundCleanups() {
  if (pendingAckCleanupInterval) {
    clearInterval(pendingAckCleanupInterval);
    pendingAckCleanupInterval = null;
  }
  if (receiveTimeoutInterval) {
    clearInterval(receiveTimeoutInterval);
    receiveTimeoutInterval = null;
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
  stopBackgroundCleanups();
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
  if (activeSendTransfers.has(peerId)) {
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

  if (peer?.isSending) {
    usePeersStore.getState().updatePeer(peerId, { isSending: false });
  }

  if (peer?.receivingFile) {
    if (peer.receivingFile.toastId) {
      notify.updateToFailed(
        peer.receivingFile.toastId,
        peer.receivingFile.name,
        false,
      );
    }
    usePeersStore.getState().updatePeer(peerId, {
      isReceiving: false,
      receivingFile: undefined,
    });
  }
};

export const cancelAllSendTransfers = (): void => {
  if (activeSendTransfers.size === 0) return;

  activeSendTransfers.clear();

  Array.from(pendingStartAcks.keys()).forEach((fileId) => {
    resolvePendingStartAck(fileId, false);
  });

  const peers = usePeersStore.getState().targetPeers;
  peers.forEach((peer) => {
    if (peer.isSending) {
      usePeersStore.getState().updatePeer(peer.peerId, { isSending: false });
    }
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
  timeout = START_ACK_TIMEOUT_MS,
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

    const peer = usePeersStore
      .getState()
      .targetPeers.find((p) => p.peerId === peerId);

    // Idempotent: duplicate file-start (sender retry) — just re-ack
    if (peer?.receivingFile?.fileId === fileStart.fileId) {
      void conn?.send({
        type: "file-start-ack" as const,
        fileId: fileStart.fileId,
      });
      return;
    }

    const toastId =
      fileStart.size > PROGRESS_TOAST_THRESHOLD
        ? notify.receivingFile(fileStart.name)
        : undefined;

    usePeersStore.getState().updatePeer(peerId, {
      isReceiving: true,
      receivingFile: {
        fileId: fileStart.fileId,
        name: fileStart.name,
        size: fileStart.size,
        totalChunks: fileStart.totalChunks,
        receivedChunks: new Array(fileStart.totalChunks),
        receivedCount: 0,
        lastChunkAt: Date.now(),
        toastId,
      },
    });
    startBackgroundCleanups();

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
    receivingFile.lastChunkAt = Date.now();

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
        isReceiving: false,
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
      isReceiving: false,
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
          .updatePeer(ackInfo.peerId, { isSending: false });

        pendingAcks.delete(ackData.ackId);
      }
      return;
    }
  }
};

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

const awaitBufferedAmountLow = (connection: DataConnection): Promise<void> => {
  const dc = (connection as unknown as { dataChannel?: RTCDataChannel })
    .dataChannel;
  if (!dc) return Promise.resolve();
  if (dc.bufferedAmount < HIGH_WATERMARK) return Promise.resolve();
  dc.bufferedAmountLowThreshold = LOW_WATERMARK;
  return new Promise((resolve) => {
    const onLow = () => {
      dc.removeEventListener("bufferedamountlow", onLow);
      resolve();
    };
    dc.addEventListener("bufferedamountlow", onLow);
  });
};

const sendFileChunk = async (
  connection: DataConnection,
  fileChunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  fileId: string,
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
};

const sendFileToPeer = async (
  file: File,
  peerId: string,
  connection: DataConnection,
  reportProgress?: ProgressReporter,
): Promise<boolean> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${peerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  activeSendTransfers.set(peerId, {
    fileId,
    fileName: file.name,
  });

  try {
    let startAcked = false;
    for (
      let attempt = 0;
      attempt < START_ACK_MAX_ATTEMPTS && !startAcked;
      attempt++
    ) {
      if (!connection.open) {
        break;
      }
      connection.send({
        type: "file-start" as const,
        fileId,
        name: file.name,
        size: file.size,
        totalChunks,
      });
      startAcked = await waitForStartAck(fileId, peerId);
      if (!startAcked && !activeSendTransfers.has(peerId)) {
        // Cancelled externally during the wait — abort
        return false;
      }
    }

    if (!startAcked) {
      activeSendTransfers.delete(peerId);
      return false;
    }

    let chunkIndex = 0;
    let offset = 0;

    while (offset < file.size) {
      if (shouldStopTransfer(peerId, connection)) {
        return false;
      }

      await awaitBufferedAmountLow(connection);

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      await sendFileChunk(
        connection,
        chunk,
        chunkIndex,
        totalChunks,
        fileId,
      );

      offset += CHUNK_SIZE;
      chunkIndex++;

      if (activeSendTransfers.has(peerId)) {
        reportProgress?.(peerId, (chunkIndex / totalChunks) * 100);
      }
    }

    connection.send({
      type: "file-end" as const,
      fileId,
    });

    pendingAcks.set(fileId, { peerId, timestamp: Date.now() });
    startBackgroundCleanups();

    activeSendTransfers.delete(peerId);
    return true;
  } catch (err) {
    console.error("[sendFileToPeer] Error:", err);
    activeSendTransfers.delete(peerId);
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
    return false;
  }

  const toastId =
    file.size > PROGRESS_TOAST_THRESHOLD
      ? notify.sendingFile(file.name)
      : undefined;

  const peerProgress = new Map<string, number>();
  const reportProgress: ProgressReporter = (peerId, progress) => {
    peerProgress.set(peerId, progress);
    if (toastId) {
      const values = Array.from(peerProgress.values());
      const aggregated = values.length > 0 ? Math.min(...values) : 0;
      updateToastProgress(toastId, file.name, aggregated, true);
    }
  };

  const results = await Promise.all(
    readyTargets.map(async (target) => {
      usePeersStore.getState().updatePeer(target.peerId, { isSending: true });
      return sendFileToPeer(
        file,
        target.peerId,
        target.connection!,
        reportProgress,
      );
    }),
  );

  const successCount = results.filter(Boolean).length;
  const failureCount = results.length - successCount;

  if (toastId) {
    if (successCount === 0) {
      updateToastFailed(toastId, file.name, true);
    } else {
      dismissToast(toastId);
    }
  }

  if (successCount > 0 && failureCount > 0) {
    notify.warning(
      `Sent to ${successCount}/${results.length} peers (${failureCount} failed)`,
    );
  } else if (successCount === 0) {
    notify.error("Failed to send file");
  }

  return successCount > 0;
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
      startBackgroundCleanups();
      void conn.send(payload);
    } catch (err) {
      console.error(err);
    }
  }
};
