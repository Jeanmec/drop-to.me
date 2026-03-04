"use client";

import { Icon } from "@/components/Icons/Icon";
import type { File } from "@/types/message.t";
import { formatFileSize, getTruncatedFileName } from "@/utils/file.utils";

interface FileAttachmentProps {
  file: File;
  received: boolean;
}

export default function FileAttachment({
  file,
  received,
}: FileAttachmentProps) {
  const handleDownload = () => {
    if (file.fileUrl) {
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.download = file.fileName;
      link.click();
    }
  };

  const formattedFileSize = formatFileSize(file.fileSize);
  const { displayName, isTruncated } = getTruncatedFileName(file.fileName, 20);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        received ? "bg-primary-blue" : "bg-secondary-blue"
      } cursor-pointer transition-opacity hover:opacity-90`}
      onClick={handleDownload}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
        <Icon.fileTransfer className="text-xl" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {isTruncated ? (
          <span className="text-sm font-medium" title={file.fileName}>
            {displayName}
          </span>
        ) : (
          <span className="text-sm font-medium">{displayName}</span>
        )}
        <span className="text-xs opacity-70">{formattedFileSize}</span>
      </div>
    </div>
  );
}
