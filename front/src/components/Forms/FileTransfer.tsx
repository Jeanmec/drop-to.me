"use client";
import { useEffect, useState } from "react";
import { peerService } from "@/services/peerService";
import { HiOutlineUpload } from "react-icons/hi";
import InputFile from "@/components/FileTransfer/InputFile";
import ParticleLoader from "@/components/loaders/ParticleLoader";
import { usePeersStore } from "@/stores/usePeersStore";

export default function FileTransferPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { targetPeers } = usePeersStore();

  const [receivedFiles, setReceivedFiles] = useState<
    { name: string; url: string }[]
  >([]);

  const handleFileSelection = async (file: File | null) => {
    if (file) {
      setFile(file);
      await handleSend(file);
      console.log("Fichier sélectionné :", file.name);
    } else {
      console.log("Aucun fichier sélectionné");
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
      setReceivedFiles((prev) => [...prev, { name: file.name, url }]);
      console.log(`[FileTransfer] Fichier reçu : ${file.name}`);
    });
  }, []);

  useEffect(() => {
    console.log(targetPeers);
  }, [targetPeers]);

  return (
    <div className="absolute top-[67.5vh] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      <div className="animate-fade-in-right flex flex-1 flex-col items-center justify-start overflow-auto">
        <InputFile
          callback={handleFileSelection}
          disabled={false}
          icon={
            file?.name ? (
              <ParticleLoader />
            ) : (
              <HiOutlineUpload className="text-4xl" />
            )
          }
        ></InputFile>

        {receivedFiles.length > 0 && (
          <div className="mt-6 w-full max-w-md">
            <h3 className="font-medium">Fichiers reçus :</h3>
            <ul className="list-disc space-y-1 pl-4">
              {receivedFiles.map((f, idx) => (
                <li key={idx}>
                  <a
                    href={f.url}
                    download={f.name}
                    className="text-blue-300 underline"
                  >
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
