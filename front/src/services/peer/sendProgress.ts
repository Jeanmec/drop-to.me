import {
  createTransferMeter,
  type TransferMeter,
} from "@/services/peer/transferMeter";
import { usePeersStore } from "@/stores/usePeersStore";
import type { TSendProgress } from "@/types/transfer.t";
import { toWholePercent } from "@/utils/percent.utils";
import { MILLISECONDS_PER_SECOND } from "@/utils/time.utils";

export type ByteReporter = (peerId: string, sentBytes: number) => void;

const MAX_UNCONFIRMED_PERCENT = 99;
const LONG_TRANSFER_SECONDS = 5;
const MIN_MEASURED_TRANSFER_MS = 300;

let knownBytesPerSecond: number | null = null;

export const recordTransferDuration = (
  fileSize: number,
  elapsedMs: number,
): void => {
  if (elapsedMs >= MIN_MEASURED_TRANSFER_MS) {
    knownBytesPerSecond = (fileSize / elapsedMs) * MILLISECONDS_PER_SECOND;
  }
};

export const trackSendProgress = (
  fileSize: number,
  peerIds: string[],
  onProgress: (sendProgress: TSendProgress) => void,
): ByteReporter => {
  const startedAt = performance.now();
  const sentBytesByPeer = new Map<string, number>();
  const meters = new Map<string, TransferMeter>(
    peerIds.map((peerId) => [peerId, createTransferMeter()]),
  );
  let reported: TSendProgress = {
    progress: 0,
    remainingSeconds: null,
    isLong:
      knownBytesPerSecond !== null &&
      fileSize / knownBytesPerSecond >= LONG_TRANSFER_SECONDS,
  };
  onProgress(reported);

  const estimateRemainingSeconds = (): number | null => {
    let slowestRemainingSeconds = 0;

    for (const [peerId, sentBytes] of sentBytesByPeer) {
      const bytesPerSecond =
        meters.get(peerId)?.bytesPerSecond() ?? knownBytesPerSecond;
      if (bytesPerSecond === null || bytesPerSecond <= 0) {
        return null;
      }
      slowestRemainingSeconds = Math.max(
        slowestRemainingSeconds,
        (fileSize - sentBytes) / bytesPerSecond,
      );
    }
    return Math.ceil(slowestRemainingSeconds);
  };

  return (peerId, sentBytes) => {
    const previousPercent = toWholePercent(
      sentBytesByPeer.get(peerId) ?? 0,
      fileSize,
    );
    const percent = toWholePercent(sentBytes, fileSize);
    if (percent !== previousPercent) {
      usePeersStore.getState().updatePeer(peerId, {
        sendProgress: Math.min(MAX_UNCONFIRMED_PERCENT, percent),
      });
    }

    sentBytesByPeer.set(peerId, sentBytes);
    meters.get(peerId)?.record(sentBytes);

    const progress = toWholePercent(
      Math.min(...sentBytesByPeer.values()),
      fileSize,
    );
    const remainingSeconds = estimateRemainingSeconds();
    const elapsedSeconds =
      (performance.now() - startedAt) / MILLISECONDS_PER_SECOND;
    const isLong =
      reported.isLong ||
      (remainingSeconds !== null &&
        elapsedSeconds + remainingSeconds >= LONG_TRANSFER_SECONDS);

    if (
      progress !== reported.progress ||
      remainingSeconds !== reported.remainingSeconds ||
      isLong !== reported.isLong
    ) {
      reported = { progress, remainingSeconds, isLong };
      onProgress(reported);
    }
  };
};
