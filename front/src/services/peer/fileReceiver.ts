import type {
  TFileEndMessage,
  TFileStartMessage,
} from "@/schemas/peerMessage.schema";
import { sendPeerMessage } from "@/services/peer/peerChannel";
import {
  dismissToast,
  failIncomingFile,
  notify,
  showIncomingFile,
  showReceivedFile,
  updateIncomingFile,
} from "@/services/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { PeerMessageType } from "@/types/peerMessage.t";
import { toWholePercent } from "@/utils/percent.utils";

interface ReceivingFile {
  fileId: string;
  name: string;
  size: number;
  receivedBytes: number;
  chunks: ArrayBuffer[];
  blobs: Blob[];
  toastId: string;
}

// a Blob hands its bytes over to the browser, which can page them to disk
const RECEIVED_CHUNKS_PER_BLOB = 1024;

const receivingFiles = new Map<string, ReceivingFile>();

const receivedPercent = (receivingFile: ReceivingFile): number =>
  toWholePercent(receivingFile.receivedBytes, receivingFile.size);

const acknowledge = (channel: RTCDataChannel, ackId: string): void => {
  sendPeerMessage(channel, { type: PeerMessageType.ACK, ackId });
};

const deliverFile = (
  fileName: string,
  fileSize: number,
  data: Blob,
  toastId: string,
): void => {
  const fileUrl = URL.createObjectURL(data);

  showReceivedFile(fileName, fileSize, fileUrl, toastId);
  useChatStore.getState().addMessage({
    received: true,
    content: "",
    file: { fileName, fileSize, fileUrl },
  });
};

const appendToReceivingFile = (
  receivingFile: ReceivingFile,
  chunk: ArrayBuffer,
): void => {
  const previousPercent = receivedPercent(receivingFile);

  receivingFile.chunks.push(chunk);
  receivingFile.receivedBytes += chunk.byteLength;
  if (receivingFile.chunks.length === RECEIVED_CHUNKS_PER_BLOB) {
    receivingFile.blobs.push(new Blob(receivingFile.chunks));
    receivingFile.chunks = [];
  }

  const percent = receivedPercent(receivingFile);
  if (percent !== previousPercent) {
    updateIncomingFile(receivingFile.toastId, receivingFile.name, percent);
  }
};

const stopReceiving = (peerId: string): void => {
  receivingFiles.delete(peerId);
  usePeersStore.getState().updatePeer(peerId, { isReceiving: false });
};

export const receiveFileStart = (
  message: TFileStartMessage,
  peerId: string,
  channel: RTCDataChannel,
): void => {
  // a sender that retries repeats its file-start
  if (receivingFiles.get(peerId)?.fileId !== message.fileId) {
    receivingFiles.set(peerId, {
      fileId: message.fileId,
      name: message.name,
      size: message.size,
      receivedBytes: 0,
      chunks: [],
      blobs: [],
      toastId: showIncomingFile(message.name),
    });
    usePeersStore.getState().updatePeer(peerId, { isReceiving: true });
  }

  sendPeerMessage(channel, {
    type: PeerMessageType.FILE_START_ACK,
    fileId: message.fileId,
  });
};

export const receiveFileBytes = (
  bytes: ArrayBuffer,
  peerId: string,
  channel: RTCDataChannel,
): void => {
  const receivingFile = receivingFiles.get(peerId);
  if (!receivingFile) {
    return;
  }

  appendToReceivingFile(receivingFile, bytes);
  sendPeerMessage(channel, {
    type: PeerMessageType.FILE_PROGRESS,
    fileId: receivingFile.fileId,
    receivedBytes: receivingFile.receivedBytes,
  });
};

export const receiveFileEnd = (
  message: TFileEndMessage,
  peerId: string,
  channel: RTCDataChannel,
): void => {
  const receivingFile = receivingFiles.get(peerId);
  if (receivingFile?.fileId !== message.fileId) {
    return;
  }

  stopReceiving(peerId);

  if (receivingFile.receivedBytes !== receivingFile.size) {
    dismissToast(receivingFile.toastId);
    notify.error("File transfer incomplete");
    channel.close();
    return;
  }

  deliverFile(
    receivingFile.name,
    receivingFile.size,
    new Blob([...receivingFile.blobs, ...receivingFile.chunks]),
    receivingFile.toastId,
  );
  acknowledge(channel, message.fileId);
};

export const abortReceiving = (peerId: string): void => {
  const receivingFile = receivingFiles.get(peerId);
  if (receivingFile) {
    stopReceiving(peerId);
    failIncomingFile(receivingFile.toastId, receivingFile.name);
  }
};
