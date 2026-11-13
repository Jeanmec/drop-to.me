"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  sendFileToTargets,
  setOnFileReceivedCallback,
  removeOnFileReceivedCallback,
} from "@/services/peerService";
import { statService } from "@/services/statService";
import { notify } from "@/library/toastService";
import { usePeersStore } from "@/stores/usePeersStore";
import InputFile from "@/components/Forms/FileTransfer/InputFile";
import TransferStatus from "@/components/Forms/FileTransfer/TransferStatus";
import GlobalFileDropzone from "@/components/Forms/FileTransfer/GlobalFileDropzone";
import Alone from "@/components/Clients/Alone";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { useChatStore } from "@/stores/useChatStore";
import { createZipFromFiles } from "@/utils/zip.utils";
import { useWindowFileDrag } from "@/hooks/useWindowFileDrag";
import { useScreenWakeLock } from "@/hooks/useScreenWakeLock";
import type { TTransferPhase } from "@/types/file.t";

const WAITING_TIMEOUT_MS = 60_000;
const MAX_TRANSFER_RETRIES = 3;

interface FileTransferPanelProps {
  isActive?: boolean;
  isConnecting: boolean;
}

interface TransferFlags {
  isWaiting: boolean;
  isSending: boolean;
  isDragging: boolean;
  isDone: boolean;
}

const phaseOf = ({
  isWaiting,
  isSending,
  isDragging,
  isDone,
}: TransferFlags): TTransferPhase => {
  if (isWaiting) {
    return "waiting";
  }
  if (isSending) {
    return "sending";
  }
  if (isDragging) {
    return "drag";
  }
  return isDone ? "done" : "idle";
};

const sendLabelOf = (phase: TTransferPhase): string => {
  switch (phase) {
    case "drag":
      return "Drop to send";
    case "waiting":
    case "sending":
      return "Sending file";
    case "idle":
    case "done":
      return "Send files";
  }
};

// Stays mounted while the user is alone: unmounting would detach the file input
// while the native picker is open (Android backgrounds the page), losing the selection.
export default function FileTransferPanel({
  isActive = true,
  isConnecting,
}: FileTransferPanelProps) {
  const { targetPeers } = usePeersStore();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAwaitingConnection, setIsAwaitingConnection] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [sentFileName, setSentFileName] = useState("");
  const [isDone, setIsDone] = useState(false);
  const transferStartTime = useRef<number | null>(null);
  const sendInProgressRef = useRef(false);
  const transferSucceededRef = useRef(false);
  const isMountedRef = useRef(true);
  const waitingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const { isDragFileActive } = useDragFileStore();
  const { addMessage } = useChatStore();

  const hasReadyConnection = useMemo(
    () => targetPeers.some((peer) => peer.isReachable),
    [targetPeers],
  );
  const anySending = useMemo(
    () => targetPeers.some((peer) => peer.isSending),
    [targetPeers],
  );
  const isSendingOrReceiving = useMemo(
    () => targetPeers.some((peer) => peer.isSending || peer.isReceiving),
    [targetPeers],
  );

  const clearWaitingTimeout = useCallback(() => {
    if (waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = null;
    }
  }, []);

  const resetTransferState = useCallback(() => {
    setPendingFile(null);
    setIsAwaitingConnection(false);
    setIsProcessingFile(false);
    setIsZipping(false);
    sendInProgressRef.current = false;
    retryCountRef.current = 0;
    transferStartTime.current = null;
    clearWaitingTimeout();
  }, [clearWaitingTimeout]);

  const handleSend = useCallback(async (file: File) => {
    const success = await sendFileToTargets(file);
    if (success) {
      statService.addFileStat(file.size);
    }
    return success;
  }, []);

  const armWaitingTimeout = useCallback(() => {
    clearWaitingTimeout();
    waitingTimeoutRef.current = setTimeout(() => {
      notify.error("No peers available — file not sent.");
      resetTransferState();
    }, WAITING_TIMEOUT_MS);
  }, [clearWaitingTimeout, resetTransferState]);

  const handleFileSelection = useCallback(
    async (files: File[] | null) => {
      if (!files || files.length === 0) return;

      setIsDone(false);
      let fileToSend: File;

      if (files.length === 1) {
        fileToSend = files[0];
      } else {
        setIsZipping(true);
        setWaitingMessage(`Zipping ${files.length} files...`);
        try {
          fileToSend = await createZipFromFiles(files);
        } catch {
          notify.error("Failed to zip selected files.");
          return;
        } finally {
          setIsZipping(false);
        }
      }

      if (!isMountedRef.current) return;
      retryCountRef.current = 0;
      setPendingFile(fileToSend);

      if (!hasReadyConnection) {
        setIsAwaitingConnection(true);
        setWaitingMessage(
          targetPeers.length === 0
            ? "Waiting for a peer to join..."
            : "Waiting for the connection to your peer...",
        );
        armWaitingTimeout();
      }
    },
    [hasReadyConnection, targetPeers.length, armWaitingTimeout],
  );

  useEffect(() => {
    if (!pendingFile || !hasReadyConnection || sendInProgressRef.current) {
      return;
    }

    sendInProgressRef.current = true;
    setIsAwaitingConnection(false);
    clearWaitingTimeout();

    const startTransfer = async () => {
      const fileToSend = pendingFile;
      try {
        setIsProcessingFile(true);
        setSentFileName(fileToSend.name);
        transferSucceededRef.current = false;
        const success = await handleSend(fileToSend);
        if (!isMountedRef.current) return;

        if (success) {
          transferSucceededRef.current = true;
          addMessage({
            received: false,
            content: "",
            timestamp: new Date(),
            file: {
              fileName: fileToSend.name,
              fileSize: fileToSend.size,
            },
          });
          resetTransferState();
        } else {
          transferSucceededRef.current = false;
          retryCountRef.current += 1;
          sendInProgressRef.current = false;
          setIsProcessingFile(false);
          if (retryCountRef.current >= MAX_TRANSFER_RETRIES) {
            notify.error("Failed to send file after several attempts.");
            resetTransferState();
          } else {
            // Keep pendingFile — the effect will re-trigger when a fresh
            // ready connection appears (e.g. after a reconnect).
            setIsAwaitingConnection(true);
            setWaitingMessage(
              "Transfer interrupted. It restarts when your peer is back.",
            );
            armWaitingTimeout();
          }
        }
      } catch (error) {
        console.error("[FileTransfer] Send failed:", error);
        if (!isMountedRef.current) return;
        notify.error("Failed to send file.");
        resetTransferState();
      }
    };

    void startTransfer();
  }, [
    pendingFile,
    hasReadyConnection,
    handleSend,
    addMessage,
    resetTransferState,
    clearWaitingTimeout,
    armWaitingTimeout,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearWaitingTimeout();
    };
  }, [clearWaitingTimeout]);

  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    setOnFileReceivedCallback((file) => {
      const url = URL.createObjectURL(file.data);
      blobUrlsRef.current.push(url);
      notify.receivedFile({
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
      });

      addMessage({
        received: true,
        content: "",
        timestamp: new Date(),
        file: {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: url,
        },
      });
    });

    return () => {
      removeOnFileReceivedCallback();
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, [addMessage]);

  const [isInTransfer, setIsInTransfer] = useState(false);
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (anySending) {
      if (!isInTransfer) {
        setIsInTransfer(true);
        transferStartTime.current = Date.now();
      }
    } else if (isInTransfer) {
      const elapsedTime = Date.now() - (transferStartTime.current ?? 0);
      const remainingTime = 3000 - elapsedTime;

      const completeTransfer = () => {
        setIsInTransfer(false);
        transferStartTime.current = null;
        if (transferSucceededRef.current) {
          transferSucceededRef.current = false;
          setIsDone(true);
        }
      };

      if (remainingTime > 0) {
        timeout = setTimeout(completeTransfer, remainingTime);
      } else {
        completeTransfer();
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isInTransfer, anySending]);

  useWindowFileDrag(isActive);
  useScreenWakeLock(isSendingOrReceiving);

  const isTransferLocked =
    isInTransfer ||
    isAwaitingConnection ||
    pendingFile !== null ||
    isProcessingFile ||
    isZipping;

  const sendingProgress = targetPeers
    .filter((peer) => peer.isSending)
    .map((peer) => peer.sendProgress ?? 0);
  const heldProgress = pendingFile ? 0 : 100;
  const phase = phaseOf({
    isWaiting: isZipping || isAwaitingConnection,
    isSending: isInTransfer || isProcessingFile || pendingFile !== null,
    isDragging: isDragFileActive,
    isDone,
  });

  return (
    <>
      <GlobalFileDropzone
        onFileSelected={handleFileSelection}
        disabled={isTransferLocked || !isActive}
        isDragging={isDragFileActive}
      />
      <InputFile
        callback={handleFileSelection}
        disabled={isTransferLocked}
        hasNoRecipient={!isActive}
        isDropTarget={isDragFileActive}
        label={sendLabelOf(phase)}
      />
      <div role="status" className="grid justify-items-center gap-2">
        {phase === "idle" && !isActive ? (
          <Alone isConnecting={isConnecting} />
        ) : (
          <TransferStatus
            phase={phase}
            peerCount={targetPeers.length}
            connectedCount={
              targetPeers.filter((peer) => peer.isReachable).length
            }
            waitingMessage={waitingMessage}
            fileName={sentFileName}
            progress={
              sendingProgress.length > 0
                ? Math.min(...sendingProgress)
                : heldProgress
            }
            onDoneShown={() => setIsDone(false)}
          />
        )}
      </div>
    </>
  );
}
