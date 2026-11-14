import { cancelAllSends, sendFileToTargets } from "@/services/peer/fileSender";
import { addFileStat } from "@/services/statService";
import { notify } from "@/services/toastService";
import { useChatStore } from "@/stores/useChatStore";
import { selectHasReachablePeer, usePeersStore } from "@/stores/usePeersStore";
import {
  selectIsTransferLocked,
  useTransferStore,
} from "@/stores/useTransferStore";
import { createZipFromFiles } from "@/utils/zip.utils";

const MAX_SEND_ATTEMPTS = 3;

let currentRun = 0;
let settleWaiting: ((isReady: boolean) => void) | null = null;

const describeWaiting = (isRetry: boolean): string => {
  if (isRetry) {
    return "Transfer interrupted. It restarts when your peer is back.";
  }
  return usePeersStore.getState().targetPeers.length === 0
    ? "Waiting for a peer to join..."
    : "Waiting for the connection to your peer...";
};

// a retry waits for a peer that came back: the link that just failed may still read as reachable
const waitForReachablePeer = (isRetry: boolean): Promise<boolean> => {
  const isReachable = () => selectHasReachablePeer(usePeersStore.getState());

  if (isReachable() && !isRetry) {
    return Promise.resolve(true);
  }
  useTransferStore.getState().startWaiting(describeWaiting(isRetry));

  return new Promise((resolve) => {
    let hasDropped = !isReachable();

    const settle = (isReady: boolean) => {
      unsubscribe();
      settleWaiting = null;
      resolve(isReady);
    };
    const unsubscribe = usePeersStore.subscribe(() => {
      if (!isReachable()) {
        hasDropped = true;
      } else if (hasDropped) {
        settle(true);
      }
    });
    settleWaiting = settle;
  });
};

const bundleFiles = async (files: File[]): Promise<File | null> => {
  if (files.length === 1) {
    return files[0];
  }

  useTransferStore.getState().startZipping(files.length);
  try {
    return await createZipFromFiles(files);
  } catch {
    notify.error("Failed to zip selected files.");
    return null;
  }
};

const sendWithRetries = async (file: File, run: number): Promise<void> => {
  const transfer = useTransferStore.getState();

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    const isReady = await waitForReachablePeer(attempt > 1);
    if (run !== currentRun) {
      return;
    }
    if (!isReady) {
      notify.error("No peers available — file not sent.");
      transfer.reset();
      return;
    }

    transfer.startSending(file.name);
    const isSent = await sendFileToTargets(file, transfer.reportProgress);
    if (run !== currentRun) {
      return;
    }
    if (isSent) {
      addFileStat(file.size);
      useChatStore.getState().addMessage({
        received: false,
        content: "",
        file: { fileName: file.name, fileSize: file.size },
      });
      transfer.finish();
      return;
    }
  }

  notify.error("Failed to send file after several attempts.");
  transfer.reset();
};

export const sendFiles = async (files: File[]): Promise<void> => {
  const transfer = useTransferStore.getState();
  if (files.length === 0 || selectIsTransferLocked(transfer)) {
    return;
  }

  currentRun += 1;
  const run = currentRun;

  try {
    const file = await bundleFiles(files);
    if (run !== currentRun) {
      return;
    }
    if (!file) {
      transfer.reset();
      return;
    }
    await sendWithRetries(file, run);
  } catch {
    if (run === currentRun) {
      notify.error("Failed to send file.");
      transfer.reset();
    }
  }
};

export const giveUpWaiting = (): void => {
  settleWaiting?.(false);
};

export const abortTransfer = (): void => {
  currentRun += 1;
  settleWaiting?.(false);
  cancelAllSends();
  useTransferStore.getState().reset();
};
