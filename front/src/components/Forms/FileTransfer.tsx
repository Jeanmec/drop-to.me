"use client";
import { useEffect, useState } from "react";
import { peerService } from "@/services/peerService";
import { HiOutlineUpload } from "react-icons/hi";
import InputFile from "@/components/FileTransfer/InputFile";
import ParticleLoader from "@/components/loaders/ParticleLoader";
import { usePeersStore } from "@/stores/usePeersStore";
import { notify } from "@/library/toastService";

export default function FileTransferPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { targetPeers, globalPeersState } = usePeersStore();
  const [isInTransfer, setIsInTransfer] = useState(false);

  const handleFileSelection = async (file: File | null) => {
    try {
      if (file) {
        setFile(file);
        await handleSend(file);
      } else {
        setFile(null);
      }
    } catch (error) {
      console.log("Error sending file:", error);
      notify.error("Failed to send file.");
    }
  };

  const handleSend = async (file: File) => {
    if (file) {
      await peerService.sendFileToTargets(file);
    }
  };

  useEffect(() => {
    peerService.setOnFileReceivedCallback((file) => {
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
      setIsInTransfer(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    } else if (isInTransfer) {
      timeout = setTimeout(() => {
        setIsInTransfer(false);
      }, 2000);
      // notify.success("File transfer completed successfully!");
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isInTransfer, targetPeers]);

  return (
    <div className="absolute top-[67.5vh] left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
      <div className="animate-fade-in-right flex flex-1 flex-col items-center justify-start overflow-auto">
        <InputFile
          callback={handleFileSelection}
          disabled={false}
          icon={
            isInTransfer ? (
              <ParticleLoader />
            ) : (
              <HiOutlineUpload className="text-4xl" />
            )
          }
        ></InputFile>
      </div>
    </div>
  );
}
