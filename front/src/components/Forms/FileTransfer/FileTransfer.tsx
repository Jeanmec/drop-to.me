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
import ParticleLoader from "@/components/loaders/ParticleLoader";
import GlobalFileDropzone from "@/components/Forms/FileTransfer/GlobalFileDropzone";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { Icon } from "../../Icons/Icon";
import { BackgroundCircle } from "@/components/Background/BackgroundCircle";
import { useChatStore } from "@/stores/useChatStore";

const WAITING_TOAST_ID = "file-transfer-awaiting-connection";

export default function FileTransferPanel() {
  const { targetPeers } = usePeersStore();
  const [isInTransfer, setIsInTransfer] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAwaitingConnection, setIsAwaitingConnection] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const transferStartTime = useRef<number | null>(null);
  const sendInProgressRef = useRef(false);

  const { isDragFileActive, setIsDragFileActive } = useDragFileStore();
  const { addMessage } = useChatStore();

  const hasReadyConnection = useMemo(
    () => targetPeers.some((peer) => peer.connection?.open),
    [targetPeers],
  );

  const resetTransferState = () => {
    setIsInTransfer(false);
    setPendingFile(null);
    setIsAwaitingConnection(false);
    setIsProcessingFile(false);
    sendInProgressRef.current = false;
    transferStartTime.current = null;
    notify.dismiss(WAITING_TOAST_ID);
  };

  const handleSend = useCallback(async (file: File) => {
    const success = await sendFileToTargets(file);
    if (success) {
      statService.addFileStat(file.size);
    }
    return success;
  }, []);

  const handleFileSelection = (file: File | null) => {
    if (!file) return;

    if (targetPeers.length === 0) {
      notify.error("No connected peers available to receive the file.");
      return;
    }

    setPendingFile(file);

    if (!hasReadyConnection) {
      setIsAwaitingConnection(true);
      notify.info("Reconnecting...", false, WAITING_TOAST_ID);
    }
  };
  useEffect(() => {
    if (!pendingFile || !hasReadyConnection || sendInProgressRef.current) {
      return;
    }

    sendInProgressRef.current = true;
    setIsAwaitingConnection(false);
    notify.dismiss(WAITING_TOAST_ID);

    const startTransfer = async () => {
      try {
        setIsProcessingFile(true);
        const fileToSend = pendingFile;
        const success = await handleSend(fileToSend);

        if (success) {
          addMessage({
            received: false,
            content: "",
            timestamp: new Date(),
            file: {
              fileName: fileToSend.name,
              fileSize: fileToSend.size,
            },
          });
        } else {
          resetTransferState();
        }
      } catch (error) {
        console.error("[FileTransfer] Send failed:", error);
        notify.error("Failed to send file.");
        resetTransferState();
      } finally {
        setPendingFile(null);
        setIsProcessingFile(false);
        sendInProgressRef.current = false;
      }
    };

    void startTransfer();
  }, [pendingFile, hasReadyConnection, handleSend, addMessage]);

  useEffect(() => {
    return () => {
      notify.dismiss(WAITING_TOAST_ID);
    };
  }, []);

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

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const anySending = targetPeers.some((peer) => peer.state === "sending");

    if (anySending) {
      if (!isInTransfer) {
        setIsInTransfer(true);
        transferStartTime.current = Date.now();
      }
    } else {
      if (isInTransfer) {
        const elapsedTime = Date.now() - (transferStartTime.current ?? 0);
        const remainingTime = 3000 - elapsedTime;

        const completeTransfer = () => {
          resetTransferState();
          notify.success("File transfer completed successfully");
        };

        if (remainingTime > 0) {
          timeout = setTimeout(completeTransfer, remainingTime);
        } else {
          completeTransfer();
        }
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isInTransfer, targetPeers]);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes("Files")) {
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
  }, [setIsDragFileActive]);

  const isTransferLocked =
    isInTransfer ||
    isAwaitingConnection ||
    pendingFile !== null ||
    isProcessingFile;

  return (
    <>
      <BackgroundCircle />
      <GlobalFileDropzone
        onFileSelected={handleFileSelection}
        disabled={isTransferLocked}
        isDragging={isDragFileActive}
      />

      <div className="absolute top-[67.5vh] left-1/2 z-[21] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-fade-in-right flex flex-1 flex-col items-center justify-start overflow-auto">
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
