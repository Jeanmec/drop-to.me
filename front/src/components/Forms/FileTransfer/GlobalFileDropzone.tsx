"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface GlobalFileDropzoneProps {
  onFileSelected: (files: File[] | null) => void;
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
      onFileSelected(acceptedFiles.length > 0 ? acceptedFiles : null);
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: true,
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
