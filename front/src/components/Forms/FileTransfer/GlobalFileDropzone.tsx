// src/components/FileTransfer/GlobalFileDropzone.tsx

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface GlobalFileDropzoneProps {
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
  isDragging: boolean;
}

export default function GlobalFileDropzone({
  onFileSelected,
  disabled,
  isDragging,
}: GlobalFileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] ?? null;
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    disabled: disabled ?? !isDragging,
  });

  return (
    <div
      {...getRootProps()}
      id="global-dropzone"
      className="fixed inset-0 z-20 transition-colors duration-200"
      style={{
        pointerEvents: isDragging ? "auto" : "none",
        backgroundColor: isDragging ? "rgba(0,0,0,0.05)" : "transparent",
      }}
    >
      <input {...getInputProps()} />
    </div>
  );
}
