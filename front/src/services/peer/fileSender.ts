import type {
  TFileProgressMessage,
  TFileStartAckMessage,
} from "@/schemas/peerMessage.schema";
import { sendPeerMessage } from "@/services/peer/peerChannel";
import {
  trackSendProgress,
  type ByteReporter,
} from "@/services/peer/sendProgress";
import { notify } from "@/services/toastService";
import { findTargetPeer, usePeersStore } from "@/stores/usePeersStore";
import type { TPeerChannel } from "@/types/peerChannel.t";
import { PeerMessageType } from "@/types/peerMessage.t";
import type { TSendProgress } from "@/types/transfer.t";
import { getTruncatedFileName } from "@/utils/file.utils";
import { COMPLETE_PERCENT } from "@/utils/percent.utils";
import { createRandomId } from "@/utils/random.utils";

interface SendTransfer {
  fileId: string;
  isStarted: boolean;
  receivedBytes: number;
  resume: () => void;
}

const CHUNK_SIZE = 16 * 1024;
// bytes a receiver may leave unacknowledged: TCP and the relay hold back what it has not taken yet
const SEND_WINDOW = 4 * 1024 * 1024;

const activeSendTransfers = new Map<string, SendTransfer>();
const pendingFileAcks = new Map<string, string>();

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

export const cancelSendTo = (peerId: string): void => {
  const sendTransfer = activeSendTransfers.get(peerId);
  if (sendTransfer) {
    activeSendTransfers.delete(peerId);
    sendTransfer.resume();
  }

  pendingFileAcks.forEach((ackPeerId, fileId) => {
    if (ackPeerId === peerId) {
      pendingFileAcks.delete(fileId);
    }
  });

  if (findTargetPeer(peerId)?.isSending) {
    usePeersStore.getState().updatePeer(peerId, { isSending: false });
  }
};

export const cancelAllSends = (): void => {
  [...activeSendTransfers.keys()].forEach(cancelSendTo);
};

export const acknowledgeFileStart = (
  peerId: string,
  message: TFileStartAckMessage,
): void => {
  const sendTransfer = findSendTransfer(peerId, message.fileId);
  if (sendTransfer) {
    sendTransfer.isStarted = true;
    sendTransfer.resume();
  }
};

export const acknowledgeFileProgress = (
  peerId: string,
  message: TFileProgressMessage,
): void => {
  const sendTransfer = findSendTransfer(peerId, message.fileId);
  if (sendTransfer) {
    sendTransfer.receivedBytes = message.receivedBytes;
    sendTransfer.resume();
  }
};

export const confirmFileReceived = (fileId: string): void => {
  const peerId = pendingFileAcks.get(fileId);
  if (peerId) {
    pendingFileAcks.delete(fileId);
    usePeersStore
      .getState()
      .updatePeer(peerId, { isSending: false, sendProgress: COMPLETE_PERCENT });
  }
};

const shouldStopTransfer = (peerId: string, channel: TPeerChannel): boolean => {
  if (!activeSendTransfers.has(peerId)) {
    return true;
  }
  if (!channel.isOpen()) {
    cancelSendTo(peerId);
    return true;
  }
  return false;
};

const sendChunks = async (
  file: File,
  peerId: string,
  channel: TPeerChannel,
  sendTransfer: SendTransfer,
  reportBytes: ByteReporter,
): Promise<boolean> => {
  let sentBytes = 0;
  let acknowledgedBytes = 0;

  while (acknowledgedBytes < file.size) {
    const sendableChunks = Math.floor(
      (SEND_WINDOW - (sentBytes - acknowledgedBytes)) / CHUNK_SIZE,
    );

    if (sentBytes < file.size && sendableChunks > 0) {
      const burst = new Uint8Array(
        await file
          .slice(sentBytes, sentBytes + sendableChunks * CHUNK_SIZE)
          .arrayBuffer(),
      );

      if (shouldStopTransfer(peerId, channel)) {
        return false;
      }

      for (
        let burstOffset = 0;
        burstOffset < burst.byteLength;
        burstOffset += CHUNK_SIZE
      ) {
        channel.sendBytes(
          burst.subarray(burstOffset, burstOffset + CHUNK_SIZE),
        );
      }
      sentBytes += burst.byteLength;
    } else {
      await waitForReceiver(sendTransfer);

      if (shouldStopTransfer(peerId, channel)) {
        return false;
      }
    }

    acknowledgedBytes = sendTransfer.receivedBytes;
    reportBytes(peerId, acknowledgedBytes);
  }

  return true;
};

const sendFileToPeer = async (
  file: File,
  peerId: string,
  channel: TPeerChannel,
  reportBytes: ByteReporter,
): Promise<boolean> => {
  const fileId = createRandomId();
  const sendTransfer: SendTransfer = {
    fileId,
    isStarted: false,
    receivedBytes: 0,
    resume: () => undefined,
  };
  const resumeSendTransfer = () => sendTransfer.resume();

  activeSendTransfers.set(peerId, sendTransfer);
  channel.onClose(resumeSendTransfer);

  try {
    sendPeerMessage(channel, {
      type: PeerMessageType.FILE_START,
      fileId,
      name: file.name,
      size: file.size,
    });
    await waitForReceiver(sendTransfer);

    if (
      !sendTransfer.isStarted ||
      shouldStopTransfer(peerId, channel) ||
      !(await sendChunks(file, peerId, channel, sendTransfer, reportBytes))
    ) {
      return false;
    }

    sendPeerMessage(channel, { type: PeerMessageType.FILE_END, fileId });
    pendingFileAcks.set(fileId, peerId);
    return true;
  } catch {
    channel.close();
    return false;
  } finally {
    channel.offClose(resumeSendTransfer);
    if (activeSendTransfers.get(peerId) === sendTransfer) {
      activeSendTransfers.delete(peerId);
    }
  }
};

export const sendFileToTargets = async (
  file: File,
  onProgress: (sendProgress: TSendProgress) => void,
): Promise<boolean> => {
  const { targetPeers, updatePeer } = usePeersStore.getState();
  const targets = targetPeers.filter((target) => target.isReachable);

  if (targets.length === 0) {
    return false;
  }

  const reportBytes = trackSendProgress(
    file.size,
    targets.map((target) => target.peerId),
    onProgress,
  );

  const results = await Promise.all(
    targets.map(async (target) => {
      if (!target.channel) {
        return false;
      }
      updatePeer(target.peerId, { isSending: true, sendProgress: 0 });
      const isSent = await sendFileToPeer(
        file,
        target.peerId,
        target.channel,
        reportBytes,
      );
      if (!isSent) {
        updatePeer(target.peerId, { isSending: false });
      }
      return isSent;
    }),
  );

  const sentCount = results.filter(Boolean).length;
  const failedCount = results.length - sentCount;

  if (sentCount === 0) {
    notify.error("Failed sending", getTruncatedFileName(file.name).displayName);
    return false;
  }
  if (failedCount > 0) {
    notify.warning(
      `Sent to ${sentCount}/${results.length} peers (${failedCount} failed)`,
    );
  }

  return true;
};
