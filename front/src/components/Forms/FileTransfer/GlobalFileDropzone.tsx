"use client";

import clsx from "clsx";
import { useDropzone } from "react-dropzone";

interface GlobalFileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
  isDropTarget: boolean;
}

export default function GlobalFileDropzone({
  onFilesSelected,
  disabled,
  isDropTarget,
}: GlobalFileDropzoneProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFilesSelected,
    noClick: true,
    noKeyboard: true,
    multiple: true,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "fixed inset-0 z-20 transition-colors duration-200",
        isDropTarget ? "bg-veil pointer-events-auto" : "pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
    </div>
  );
}
