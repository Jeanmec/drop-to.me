"use client";

import { useEffect, useState, useRef } from "react"; // Importer useRef
import { peerService } from "@/services/peerService";
import { statService } from "@/services/statService";
import { notify } from "@/library/toastService";
import { usePeersStore } from "@/stores/usePeersStore";
import InputFile from "@/components/Forms/FileTransfer/InputFile";
import ParticleLoader from "@/components/loaders/ParticleLoader";
import GlobalFileDropzone from "@/components/Forms/FileTransfer/GlobalFileDropzone";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { Icon } from "../../Icons/Icon";

export default function FileTransferPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { targetPeers } = usePeersStore();
  const [isInTransfer, setIsInTransfer] = useState(false);
  const transferStartTime = useRef<number | null>(null);

  const { isDragFileActive, setIsDragFileActive } = useDragFileStore();

  const handleFileSelection = async (file: File | null) => {
    console.trace("handleFileSelection triggered");
    try {
      if (file) {
        console.log(file);
        setFile(file);
        transferStartTime.current = Date.now();
        setIsInTransfer(true);
        await handleSend(file);
      } else {
        setFile(null);
      }
    } catch (error) {
      console.error("Error sending file:", error);
      notify.error("Failed to send file.");
      setIsInTransfer(false);
      transferStartTime.current = null;
    }
  };

  const handleSend = async (file: File) => {
    await peerService.sendFileToTargets(file);
    await statService.sendFile(file.size);
  };

  useEffect(() => {
    peerService.setOnFileReceivedCallback((file) => {
      console.log("File received:", file.name);
      const url = URL.createObjectURL(file.data);
      notify.receivedFile({
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
      });
    });
  }, []);

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

        if (remainingTime > 0) {
          timeout = setTimeout(() => {
            setIsInTransfer(false);
            notify.success("File transfer completed successfully");
            transferStartTime.current = null;
          }, remainingTime);
        } else {
          setIsInTransfer(false);
          notify.success("File transfer completed successfully");
          transferStartTime.current = null;
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

  return (
    <>
      <GlobalFileDropzone
        onFileSelected={handleFileSelection}
        disabled={isInTransfer}
        isDragging={isDragFileActive}
      />

      <div className="absolute top-[67.5vh] left-1/2 z-[21] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-fade-in-right flex flex-1 flex-col items-center justify-start overflow-auto">
          <InputFile
            className={isDragFileActive ? "scale-110" : ""}
            callback={handleFileSelection}
            disabled={isInTransfer}
            icon={
              isDragFileActive ? (
                <Icon.downloadAnimated className="text-5xl" />
              ) : isInTransfer ? (
                <ParticleLoader />
              ) : (
                <Icon.upload className="animate-fade-in text-primary-blue text-4xl" />
              )
            }
          />
        </div>
      </div>
    </>
  );
}
