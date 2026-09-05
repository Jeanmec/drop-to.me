"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { zip, type AsyncZippable } from "fflate";
import {
  sendFileToTargets,
  setOnFileReceivedCallback,
  removeOnFileReceivedCallback,
} from "@/services/peerService";
import { statService } from "@/services/statService";
import { notify } from "@/library/toastService";
import { usePeersStore } from "@/stores/usePeersStore";
import InputFile from "@/components/Forms/FileTransfer/InputFile";
import ParticleLoader from "@/components/loaders/ParticleLoader";
import GlobalFileDropzone from "@/components/Forms/FileTransfer/GlobalFileDropzone";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { Icon } from "../../Icons/Icon";
import { BackgroundCircle } from "@/components/Background/BackgroundCircle";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/library/utils";

const WAITING_TOAST_ID = "file-transfer-awaiting-connection";
const ZIPPING_TOAST_ID = "file-transfer-zipping";
const WAITING_TIMEOUT_MS = 60_000;
const MAX_TRANSFER_RETRIES = 3;
const ZIP_TOAST_DELAY_MS = 300;
const ZIP_TOAST_MIN_VISIBLE_MS = 800;

interface FileTransferPanelProps {
  isActive?: boolean;
}

const createZipFromFiles = (files: File[]): Promise<File> => {
  return new Promise((resolve, reject) => {
    Promise.all(
      files.map(async (file) => ({
        name: file.name,
        data: new Uint8Array(await file.arrayBuffer()),
      })),
    )
      .then((entries) => {
        const zippable: AsyncZippable = {};
        const usedNames = new Set<string>();
        for (const entry of entries) {
          let name = entry.name;
          let counter = 1;
          while (usedNames.has(name)) {
            const dot = entry.name.lastIndexOf(".");
            const base = dot > 0 ? entry.name.slice(0, dot) : entry.name;
            const ext = dot > 0 ? entry.name.slice(dot) : "";
            name = `${base} (${counter})${ext}`;
            counter++;
          }
          usedNames.add(name);
          zippable[name] = entry.data;
        }
        // level: 0 = store-only (no compression). Most user-shared files
        // (photos, videos, archives) are already compressed; trade CPU for speed.
        zip(zippable, { level: 0 }, (err, data) => {
          if (err) return reject(err);
          const blob = new Blob([data as BlobPart], {
            type: "application/zip",
          });
          const timestamp = new Date()
            .toISOString()
            .replace(/[:T]/g, "-")
            .slice(0, 19);
          const zipFile = new File(
            [blob],
            `drop-${files.length}-files-${timestamp}.zip`,
            { type: "application/zip" },
          );
          resolve(zipFile);
        });
      })
      .catch(reject);
  });
};

// Stays mounted while the user is alone: unmounting would detach the file input
// while the native picker is open (Android backgrounds the page), losing the selection.
export default function FileTransferPanel({
  isActive = true,
}: FileTransferPanelProps) {
  const { targetPeers } = usePeersStore();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAwaitingConnection, setIsAwaitingConnection] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const transferStartTime = useRef<number | null>(null);
  const sendInProgressRef = useRef(false);
  const transferSucceededRef = useRef(false);
  const isMountedRef = useRef(true);
  const waitingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const { isDragFileActive, setIsDragFileActive } = useDragFileStore();
  const { addMessage } = useChatStore();

  const hasReadyConnection = useMemo(
    () => targetPeers.some((peer) => peer.connection?.open),
    [targetPeers],
  );
  const anySending = useMemo(
    () => targetPeers.some((peer) => peer.isSending),
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
    notify.dismiss(WAITING_TOAST_ID);
    notify.dismiss(ZIPPING_TOAST_ID);
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

      let fileToSend: File;

      if (files.length === 1) {
        fileToSend = files[0];
      } else {
        setIsZipping(true);
        const zipToast = { shownAt: null as number | null };
        const zipToastTimer = setTimeout(() => {
          if (!isMountedRef.current) return;
          notify.info(
            `Zipping ${files.length} files...`,
            false,
            ZIPPING_TOAST_ID,
          );
          zipToast.shownAt = Date.now();
        }, ZIP_TOAST_DELAY_MS);
        try {
          fileToSend = await createZipFromFiles(files);
        } catch (err) {
          clearTimeout(zipToastTimer);
          console.error("[FileTransfer] Zip failed:", err);
          notify.dismiss(ZIPPING_TOAST_ID);
          notify.error("Failed to zip selected files.");
          setIsZipping(false);
          return;
        }
        clearTimeout(zipToastTimer);
        if (zipToast.shownAt !== null) {
          const remaining =
            ZIP_TOAST_MIN_VISIBLE_MS - (Date.now() - zipToast.shownAt);
          if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
          }
          notify.dismiss(ZIPPING_TOAST_ID);
        }
        setIsZipping(false);
      }

      if (!isMountedRef.current) return;
      retryCountRef.current = 0;
      setPendingFile(fileToSend);

      if (!hasReadyConnection) {
        setIsAwaitingConnection(true);
        notify.info(
          targetPeers.length === 0
            ? "Waiting for a peer to join..."
            : "Reconnecting...",
          false,
          WAITING_TOAST_ID,
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
    notify.dismiss(WAITING_TOAST_ID);

    const startTransfer = async () => {
      const fileToSend = pendingFile;
      try {
        setIsProcessingFile(true);
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
            notify.info(
              "Transfer interrupted — retrying...",
              false,
              WAITING_TOAST_ID,
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
      notify.dismiss(WAITING_TOAST_ID);
      notify.dismiss(ZIPPING_TOAST_ID);
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
          notify.success("File transfer completed successfully");
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

  useEffect(() => {
    if (!isActive) setIsDragFileActive(false);

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isActive && e.dataTransfer?.types.includes("Files")) {
        setIsDragFileActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget === null || e.target === document.body) {
        setIsDragFileActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragFileActive(false);
    };

    const preventDefaults = (e: DragEvent) => e.preventDefault();

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", preventDefaults);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", preventDefaults);
    };
  }, [setIsDragFileActive, isActive]);

  const isTransferLocked =
    isInTransfer ||
    isAwaitingConnection ||
    pendingFile !== null ||
    isProcessingFile ||
    isZipping;

  return (
    <>
      {isActive && <BackgroundCircle />}
      <GlobalFileDropzone
        onFileSelected={handleFileSelection}
        disabled={isTransferLocked || !isActive}
        isDragging={isDragFileActive}
      />

      <div
        className={cn(
          "absolute top-[67.5vh] left-1/2 z-[21] -translate-x-1/2 -translate-y-1/2",
          !isActive && "invisible",
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-start overflow-auto",
            isActive && "animate-fade-in-right",
          )}
        >
          <InputFile
            className={isDragFileActive ? "scale-110" : ""}
            callback={handleFileSelection}
            disabled={isTransferLocked}
            icon={
              isDragFileActive ? (
                <Icon.downloadAnimated className="text-5xl" />
              ) : isTransferLocked ? (
                <ParticleLoader />
              ) : (
                <Icon.upload className="animate-fade-in text-primary-blue text-primary-shadow text-4xl" />
              )
            }
          />
        </div>
      </div>
    </>
  );
}
