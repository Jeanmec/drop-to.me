import { usePeersStore } from "@/stores/usePeersStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/message.t";
import type { TDevice, TReceivingFile } from "@/types/peer.t";
import Peer, { type DataConnection } from "peerjs";
import { notify, type ToastId } from "@/library/toastService";
import { statService } from "@/services/statService";
import { describeDevice } from "@/utils/device.utils";

export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  data: Blob;
}

type OnFileReceivedCallback = (file: ReceivedFile) => void;
type OnMessageReceivedCallback = (message: Message) => void;
type ProgressReporter = (peerId: string, progress: number) => void;
type ChunkEncoding = "bare" | "wrapped";
// peerjs delivers an ArrayBuffer, or a Uint8Array when it reassembled a message above its MTU
type PeerBinary = ArrayBuffer | Uint8Array;

interface FileStartMessage {
  type: "file-start";
  fileId: string;
  name: string;
  size: number;
}

interface FileStartAckMessage {
  type: "file-start-ack";
  fileId: string;
}

interface FileChunkMessage {
  type: "file-chunk";
  fileId: string;
  content: PeerBinary;
}

interface FileProgressMessage {
  type: "file-progress";
  fileId: string;
  receivedBytes: number;
}

interface FileEndMessage {
  type: "file-end";
  fileId: string;
}

interface LegacyFileMessage {
  type: "file";
  fileId: string;
  name: string;
  size: number;
  content: PeerBinary;
}

interface ChatMessage {
  type: "message";
  ackId: string;
  content: string;
}

interface AckMessage {
  type: "ack";
  ackId: string;
}

interface HelloMessage {
  type: "hello";
  device: TDevice;
}

type PeerMessage =
  | FileStartMessage
  | FileStartAckMessage
  | FileChunkMessage
  | FileProgressMessage
  | FileEndMessage
  | LegacyFileMessage
  | ChatMessage
  | AckMessage
  | HelloMessage;

interface SendTransfer {
  fileId: string;
  chunkEncoding: ChunkEncoding | null;
  receivedBytes: number;
  resume: () => void;
}

interface PendingMessage {
  messageId: string;
  connections: Set<DataConnection>;
}

let peerInstance: Peer | null = null;

const onFileReceivedCallbacks = new Map<string, OnFileReceivedCallback>();
const onMessageReceivedCallbacks = new Map<string, OnMessageReceivedCallback>();
const pendingAckPeerIds = new Map<string, string>();
const pendingMessages = new Map<string, PendingMessage>();

// a chunk packed above peerjs's 16300-byte MTU is split in two and reassembled in JS
const CHUNK_SIZE = 15 * 1024;
// bytes in flight beyond what the path can queue are dropped, and SCTP takes seconds to recover
const INITIAL_SEND_WINDOW = 4 * CHUNK_SIZE;
const MAX_SEND_WINDOW = 64 * CHUNK_SIZE;
// a Blob hands its bytes over to the browser, which can page them to disk
const RECEIVED_CHUNKS_PER_BLOB = 1024;
const PROGRESS_TOAST_MIN_VISIBLE_MS = 1000;
const MAX_DEVICE_LABEL_LENGTH = 40;
const MAX_UNCONFIRMED_PERCENT = 99;
const HIGH_WATERMARK = 1 * 1024 * 1024; // 1MB
const LOW_WATERMARK = 256 * 1024; // 256KB

const activeSendTransfers = new Map<string, SendTransfer>();

const progressToastShownAt = new Map<ToastId, number>();

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

  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ];
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    });
  }

  const newPeer = new Peer({
    host: peerUrl.hostname,
    port: port,
    path: "/",
    secure: isSecure,
    config: { iceServers },
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
    activeSendTransfers.delete(peerId);
    sendTransfer.resume();
  }

  pendingAckPeerIds.forEach((ackPeerId, ackId) => {
    if (ackPeerId === peerId) {
      pendingAckPeerIds.delete(ackId);
    }
  });

  const peer = usePeersStore
    .getState()
    .targetPeers.find((p) => p.peerId === peerId);

  if (peer?.isSending) {
    usePeersStore.getState().updatePeer(peerId, { isSending: false });
  }

  if (peer?.receivingFile) {
    updateToastFailed(
      peer.receivingFile.toastId,
      peer.receivingFile.name,
      false,
    );
    usePeersStore.getState().updatePeer(peerId, {
      isReceiving: false,
      receivingFile: undefined,
    });
  }
};

export const failMessagesPendingOn = (connection: DataConnection): void => {
  pendingMessages.forEach((pendingMessage, ackId) => {
    if (
      pendingMessage.connections.delete(connection) &&
      pendingMessage.connections.size === 0
    ) {
      pendingMessages.delete(ackId);
      useChatStore
        .getState()
        .setMessageDelivery(pendingMessage.messageId, "failed");
    }
  });
};

export const cancelAllSendTransfers = (): void => {
  if (activeSendTransfers.size === 0) return;

  const sendTransfers = Array.from(activeSendTransfers.values());
  activeSendTransfers.clear();
  sendTransfers.forEach((sendTransfer) => sendTransfer.resume());

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

const findSendTransfer = (
  peerId: string,
  fileId: string,
): SendTransfer | undefined => {
  const sendTransfer = activeSendTransfers.get(peerId);
  return sendTransfer?.fileId === fileId ? sendTransfer : undefined;
};

const waitForReceiver = (sendTransfer: SendTransfer): Promise<void> =>
  new Promise((resolve) => {
    sendTransfer.resume = resolve;
  });

const isPeerBinary = (value: unknown): value is PeerBinary =>
  value instanceof ArrayBuffer || value instanceof Uint8Array;

const toArrayBuffer = (binary: PeerBinary): ArrayBuffer =>
  binary instanceof ArrayBuffer ? binary : binary.slice().buffer;

const isDeviceLabel = (value: unknown): value is string =>
  typeof value === "string" && value.length <= MAX_DEVICE_LABEL_LENGTH;

const isDevice = (value: unknown): value is TDevice =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  isDeviceLabel(value.name) &&
  "browser" in value &&
  isDeviceLabel(value.browser) &&
  "system" in value &&
  isDeviceLabel(value.system);

const isPeerMessage = (value: object): value is PeerMessage => {
  if (!("type" in value)) {
    return false;
  }

  switch (value.type) {
    case "file-start":
      return (
        "fileId" in value &&
        typeof value.fileId === "string" &&
        "name" in value &&
        typeof value.name === "string" &&
        "size" in value &&
        typeof value.size === "number"
      );
    case "file-start-ack":
    case "file-end":
      return "fileId" in value && typeof value.fileId === "string";
    case "file-chunk":
      return (
        "fileId" in value &&
        typeof value.fileId === "string" &&
        "content" in value &&
        isPeerBinary(value.content)
      );
    case "file-progress":
      return (
        "fileId" in value &&
        typeof value.fileId === "string" &&
        "receivedBytes" in value &&
        typeof value.receivedBytes === "number"
      );
    case "file":
      return (
        "fileId" in value &&
        typeof value.fileId === "string" &&
        "name" in value &&
        typeof value.name === "string" &&
        "size" in value &&
        typeof value.size === "number" &&
        "content" in value &&
        isPeerBinary(value.content)
      );
    case "message":
      return (
        "ackId" in value &&
        typeof value.ackId === "string" &&
        "content" in value &&
        typeof value.content === "string"
      );
    case "ack":
      return "ackId" in value && typeof value.ackId === "string";
    case "hello":
      return "device" in value && isDevice(value.device);
    default:
      return false;
  }
};

const findReceivingFile = (peerId: string): TReceivingFile | undefined =>
  usePeersStore.getState().targetPeers.find((p) => p.peerId === peerId)
    ?.receivingFile;

const receivedPercent = (receivingFile: TReceivingFile): number =>
  Math.floor((receivingFile.receivedBytes / receivingFile.size) * 100);

const appendToReceivingFile = (
  receivingFile: TReceivingFile,
  chunk: PeerBinary,
): void => {
  const previousPercent = receivedPercent(receivingFile);

  receivingFile.chunks.push(toArrayBuffer(chunk));
  receivingFile.receivedBytes += chunk.byteLength;
  if (receivingFile.chunks.length === RECEIVED_CHUNKS_PER_BLOB) {
    receivingFile.blobs.push(new Blob(receivingFile.chunks));
    receivingFile.chunks = [];
  }

  const percent = receivedPercent(receivingFile);
  if (percent !== previousPercent) {
    updateToastProgress(
      receivingFile.toastId,
      receivingFile.name,
      percent,
      false,
    );
  }
};

const receiveFileStart = (
  message: FileStartMessage,
  peerId: string,
  conn: DataConnection | undefined,
): void => {
  // Idempotent: duplicate file-start (sender retry) — just re-ack
  if (findReceivingFile(peerId)?.fileId !== message.fileId) {
    usePeersStore.getState().updatePeer(peerId, {
      isReceiving: true,
      receivingFile: {
        fileId: message.fileId,
        name: message.name,
        size: message.size,
        receivedBytes: 0,
        chunks: [],
        blobs: [],
        toastId: showProgressToast(notify.receivingFile(message.name)),
      },
    });
  }

  void conn?.send({
    type: "file-start-ack",
    fileId: message.fileId,
    bareChunks: true,
  });
};

const receiveFileEnd = (
  message: FileEndMessage,
  peerId: string,
  conn: DataConnection | undefined,
): void => {
  const receivingFile = findReceivingFile(peerId);

  if (receivingFile?.fileId !== message.fileId) {
    console.warn("Received file-end for unknown file:", message.fileId);
    return;
  }

  dismissToast(receivingFile.toastId);
  usePeersStore.getState().updatePeer(peerId, {
    isReceiving: false,
    receivingFile: undefined,
  });

  if (receivingFile.receivedBytes !== receivingFile.size) {
    console.error(
      `Incomplete file: ${receivingFile.receivedBytes}/${receivingFile.size} bytes`,
    );
    notify.error("File transfer incomplete");
    conn?.close();
    return;
  }

  const receivedFile: ReceivedFile = {
    id: message.fileId,
    name: receivingFile.name,
    data: new Blob([...receivingFile.blobs, ...receivingFile.chunks]),
    size: receivingFile.size,
  };

  onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
  void conn?.send({ type: "ack", ackId: message.fileId });
};

// Legacy format for backward compatibility
const receiveLegacyFile = (
  message: LegacyFileMessage,
  conn: DataConnection | undefined,
): void => {
  const receivedFile: ReceivedFile = {
    id: message.fileId,
    name: message.name,
    data: new Blob([toArrayBuffer(message.content)]),
    size: message.size,
  };

  onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
  void conn?.send({ type: "ack", ackId: message.fileId });
};

const receiveChatMessage = (
  message: ChatMessage,
  conn: DataConnection | undefined,
): void => {
  if (!message.content) {
    return;
  }

  const receivedMessage = {
    received: true,
    content: message.content,
    timestamp: new Date(),
  };

  onMessageReceivedCallbacks.forEach((cb) =>
    cb({ ...receivedMessage, id: message.ackId }),
  );
  void conn?.send({ type: "ack", ackId: message.ackId });
  useChatStore.getState().addMessage(receivedMessage);
};

const receiveAck = (message: AckMessage): void => {
  const pendingMessage = pendingMessages.get(message.ackId);

  if (pendingMessage) {
    pendingMessages.delete(message.ackId);
    useChatStore
      .getState()
      .setMessageDelivery(pendingMessage.messageId, "delivered");
    statService.addMessageStat();
    return;
  }

  const ackPeerId = pendingAckPeerIds.get(message.ackId);

  if (ackPeerId) {
    usePeersStore
      .getState()
      .updatePeer(ackPeerId, { isSending: false, sendProgress: 100 });
    pendingAckPeerIds.delete(message.ackId);
  }
};

export const handleIncomingData = (
  data: unknown,
  peerId: string,
  incomingConnection?: DataConnection,
): void => {
  const conn = incomingConnection ?? getConnectionByPeerId(peerId);

  if (!usePeersStore.getState().targetPeers.some((p) => p.peerId === peerId)) {
    return;
  }

  if (isPeerBinary(data)) {
    const receivingFile = findReceivingFile(peerId);
    if (receivingFile) {
      appendToReceivingFile(receivingFile, data);
      void conn?.send({
        type: "file-progress",
        fileId: receivingFile.fileId,
        receivedBytes: receivingFile.receivedBytes,
      });
    }
    return;
  }

  if (!data || typeof data !== "object" || !isPeerMessage(data)) {
    return;
  }

  switch (data.type) {
    case "file-start":
      receiveFileStart(data, peerId, conn);
      return;
    case "file-start-ack": {
      const sendTransfer = findSendTransfer(peerId, data.fileId);
      if (sendTransfer) {
        sendTransfer.chunkEncoding =
          "bareChunks" in data && data.bareChunks === true ? "bare" : "wrapped";
        sendTransfer.resume();
      }
      return;
    }
    case "file-progress": {
      const sendTransfer = findSendTransfer(peerId, data.fileId);
      if (sendTransfer) {
        sendTransfer.receivedBytes = data.receivedBytes;
        sendTransfer.resume();
      }
      return;
    }
    case "file-chunk": {
      const receivingFile = findReceivingFile(peerId);
      if (receivingFile?.fileId !== data.fileId) {
        console.warn("Received chunk for unknown file:", data.fileId);
        return;
      }
      appendToReceivingFile(receivingFile, data.content);
      return;
    }
    case "file-end":
      receiveFileEnd(data, peerId, conn);
      return;
    case "file":
      receiveLegacyFile(data, conn);
      return;
    case "message":
      receiveChatMessage(data, conn);
      return;
    case "ack":
      receiveAck(data);
      return;
    case "hello":
      usePeersStore.getState().updatePeer(peerId, { device: data.device });
      return;
  }
};

export const sendHello = (connection: DataConnection): void => {
  if (!connection.open) {
    return;
  }
  const hello: HelloMessage = {
    type: "hello",
    device: describeDevice(navigator.userAgent, navigator.maxTouchPoints),
  };
  void connection.send(hello);
};

const showProgressToast = (toastId: ToastId): ToastId => {
  progressToastShownAt.set(toastId, Date.now());
  return toastId;
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
  if (!toastId) return;
  const shownAt = progressToastShownAt.get(toastId);
  progressToastShownAt.delete(toastId);
  const remaining =
    shownAt === undefined
      ? 0
      : PROGRESS_TOAST_MIN_VISIBLE_MS - (Date.now() - shownAt);
  if (remaining > 0) {
    setTimeout(() => notify.dismiss(toastId), remaining);
  } else {
    notify.dismiss(toastId);
  }
};

const updateToastFailed = (
  toastId: ToastId | undefined,
  fileName: string,
  isUploading: boolean,
): void => {
  if (toastId) {
    progressToastShownAt.delete(toastId);
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
  const channel = connection.dataChannel;
  if (channel.bufferedAmount < HIGH_WATERMARK) {
    return Promise.resolve();
  }
  // peerjs sets this threshold only for its MsgPack serialization
  channel.bufferedAmountLowThreshold = LOW_WATERMARK;
  return new Promise((resolve) => {
    const settle = () => {
      channel.removeEventListener("bufferedamountlow", settle);
      connection.off("close", settle);
      resolve();
    };
    channel.addEventListener("bufferedamountlow", settle);
    connection.on("close", settle);
  });
};

const sendWrappedChunks = async (
  file: File,
  peerId: string,
  connection: DataConnection,
  sendTransfer: SendTransfer,
  reportProgress?: ProgressReporter,
): Promise<boolean> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let chunkIndex = 0;
  let offset = 0;

  while (offset < file.size) {
    if (shouldStopTransfer(peerId, connection)) {
      return false;
    }

    await awaitBufferedAmountLow(connection);

    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    connection.send({
      type: "file-chunk",
      fileId: sendTransfer.fileId,
      chunkIndex,
      totalChunks,
      content: new Uint8Array(await chunk.arrayBuffer()),
    });

    offset += CHUNK_SIZE;
    chunkIndex++;

    if (activeSendTransfers.has(peerId)) {
      reportProgress?.(peerId, (chunkIndex / totalChunks) * 100);
    }
  }

  return true;
};

const sendBareChunks = async (
  file: File,
  peerId: string,
  connection: DataConnection,
  sendTransfer: SendTransfer,
  reportProgress?: ProgressReporter,
): Promise<boolean> => {
  let sentBytes = 0;
  let acknowledgedBytes = 0;
  let sendWindow = INITIAL_SEND_WINDOW;

  while (acknowledgedBytes < file.size) {
    const sendableChunks = Math.floor(
      (sendWindow - (sentBytes - acknowledgedBytes)) / CHUNK_SIZE,
    );

    if (sentBytes < file.size && sendableChunks > 0) {
      const burst = new Uint8Array(
        await file
          .slice(sentBytes, sentBytes + sendableChunks * CHUNK_SIZE)
          .arrayBuffer(),
      );

      if (shouldStopTransfer(peerId, connection)) {
        return false;
      }

      for (
        let burstOffset = 0;
        burstOffset < burst.byteLength;
        burstOffset += CHUNK_SIZE
      ) {
        connection.send(burst.subarray(burstOffset, burstOffset + CHUNK_SIZE));
      }
      sentBytes += burst.byteLength;
    } else {
      await waitForReceiver(sendTransfer);

      if (shouldStopTransfer(peerId, connection)) {
        return false;
      }
    }

    const newlyAcknowledgedBytes =
      sendTransfer.receivedBytes - acknowledgedBytes;
    sendWindow = Math.min(
      MAX_SEND_WINDOW,
      sendWindow + (CHUNK_SIZE * newlyAcknowledgedBytes) / sendWindow,
    );
    acknowledgedBytes = sendTransfer.receivedBytes;
    reportProgress?.(peerId, (acknowledgedBytes / file.size) * 100);
  }

  return true;
};

const sendChunks = (
  file: File,
  peerId: string,
  connection: DataConnection,
  sendTransfer: SendTransfer,
  reportProgress?: ProgressReporter,
): Promise<boolean> => {
  switch (sendTransfer.chunkEncoding) {
    case "bare":
      return sendBareChunks(
        file,
        peerId,
        connection,
        sendTransfer,
        reportProgress,
      );
    case "wrapped":
      return sendWrappedChunks(
        file,
        peerId,
        connection,
        sendTransfer,
        reportProgress,
      );
    case null:
      return Promise.resolve(false);
  }
};

const sendFileToPeer = async (
  file: File,
  peerId: string,
  connection: DataConnection,
  reportProgress?: ProgressReporter,
): Promise<boolean> => {
  const fileId = `${peerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sendTransfer: SendTransfer = {
    fileId,
    chunkEncoding: null,
    receivedBytes: 0,
    resume: () => undefined,
  };
  const resumeSendTransfer = () => sendTransfer.resume();

  activeSendTransfers.set(peerId, sendTransfer);
  connection.on("close", resumeSendTransfer);

  try {
    connection.send({
      type: "file-start",
      fileId,
      name: file.name,
      size: file.size,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    });
    await waitForReceiver(sendTransfer);

    if (
      shouldStopTransfer(peerId, connection) ||
      !(await sendChunks(
        file,
        peerId,
        connection,
        sendTransfer,
        reportProgress,
      ))
    ) {
      return false;
    }

    connection.send({ type: "file-end", fileId });
    pendingAckPeerIds.set(fileId, peerId);
    return true;
  } catch (err) {
    console.error("[sendFileToPeer] Error:", err);
    connection.close();
    return false;
  } finally {
    connection.off("close", resumeSendTransfer);
    if (activeSendTransfers.get(peerId) === sendTransfer) {
      activeSendTransfers.delete(peerId);
    }
  }
};

export const sendFileToTargets = async (file: File): Promise<boolean> => {
  const readyTargets = usePeersStore
    .getState()
    .targetPeers.filter((target) => target.isReachable);

  if (readyTargets.length === 0) {
    return false;
  }

  const toastId: ToastId | undefined = showProgressToast(
    notify.sendingFile(file.name),
  );

  const peerProgress = new Map<string, number>();
  const sentPercents = new Map<string, number>();
  let reportedPercent = 0;
  const reportProgress: ProgressReporter = (peerId, progress) => {
    const sendProgress = Math.min(
      MAX_UNCONFIRMED_PERCENT,
      Math.floor(progress),
    );
    if (sendProgress !== sentPercents.get(peerId)) {
      sentPercents.set(peerId, sendProgress);
      usePeersStore.getState().updatePeer(peerId, { sendProgress });
    }
    peerProgress.set(peerId, progress);
    const percent = Math.floor(Math.min(...peerProgress.values()));
    if (toastId && percent !== reportedPercent) {
      reportedPercent = percent;
      updateToastProgress(toastId, file.name, percent, true);
    }
  };

  const results = await Promise.all(
    readyTargets.map(async (target) => {
      if (!target.connection) {
        return false;
      }
      usePeersStore
        .getState()
        .updatePeer(target.peerId, { isSending: true, sendProgress: 0 });
      const isSent = await sendFileToPeer(
        file,
        target.peerId,
        target.connection,
        reportProgress,
      );
      if (!isSent) {
        usePeersStore
          .getState()
          .updatePeer(target.peerId, { isSending: false });
      }
      return isSent;
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
  }

  return successCount > 0;
};

export const sendMessageToTargets = (content: string): boolean => {
  const ackId = generateMessageId(content);
  const connections = new Set<DataConnection>();

  for (const target of usePeersStore.getState().targetPeers) {
    const conn = target.connection;
    if (!conn || !target.isReachable) {
      continue;
    }

    void conn.send({ type: "message", ackId, received: false, content });
    connections.add(conn);
  }

  if (connections.size === 0) {
    return false;
  }

  const messageId = useChatStore.getState().addMessage({
    received: false,
    content,
    timestamp: new Date(),
    delivery: "pending",
  });
  pendingMessages.set(ackId, { messageId, connections });
  return true;
};
