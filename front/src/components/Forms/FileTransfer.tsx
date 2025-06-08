"use client";
import { useEffect, useState } from "react";
import { peerService } from "@/services/peerService";
import { HiOutlineUpload } from "react-icons/hi";

export default function FileTransferPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<
    { name: string; url: string }[]
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleSend = async () => {
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

  return (
    <div className="flex flex-1 flex-col items-center justify-start overflow-auto">
      <a
        href="#"
        className="text-shadow relative m-8 flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-[0.125em] border-solid border-[rgb(16,185,129)] px-4 py-2 text-base text-[rgb(16,185,129)] no-underline shadow-[inset_0_0_0.5em_0_rgb(16,185,129),_0_0_0.5em_0_rgb(16,185,129)] [text-shadow:0_0_0.125em_hsl(0_0%_100%_/_0.3),_0_0_0.45em_rgb(16,185,129)]"
      >
        <HiOutlineUpload className="text-4xl" />
      </a>

      {/* <input type="file" onChange={handleFileChange} className="block w-full" />
      <button
        onClick={handleSend}
        disabled={!file}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Envoyer aux peers
      </button> */}

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
  );
}
