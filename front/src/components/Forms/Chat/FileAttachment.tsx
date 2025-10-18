"use client";

import { Icon } from "@/components/Icons/Icon";
import type { MessageFile } from "@/types/message.t";

interface FileAttachmentProps {
  file: MessageFile;
  received: boolean;
}

const formatFileSize = (bytes: number): string => {
  const formatter = new Intl.NumberFormat("fr-FR", {
    maximumSignificantDigits: 3,
  });

  if (bytes >= 1024 ** 3) {
    return `${formatter.format(bytes / 1024 ** 3)} Go`;
  } else if (bytes >= 1024 ** 2) {
    return `${formatter.format(bytes / 1024 ** 2)} Mo`;
  } else if (bytes >= 1024) {
    return `${formatter.format(bytes / 1024)} Ko`;
  }
  return `${formatter.format(bytes)} o`;
};

const getTruncatedFileName = (
  name: string,
  maxLength: number,
): { displayName: string; isTruncated: boolean } => {
  const lastDotIndex = name.lastIndexOf(".");
  const extension = lastDotIndex !== -1 ? name.slice(lastDotIndex) : "";
  const baseName = lastDotIndex !== -1 ? name.slice(0, lastDotIndex) : name;

  const allowedLength = maxLength - extension.length;

  if (name.length <= maxLength || allowedLength <= 0) {
    return { displayName: name, isTruncated: false };
  }

  const truncatedBase = baseName.slice(0, allowedLength - 1) + "…";
  return {
    displayName: truncatedBase + extension,
    isTruncated: true,
  };
};

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
