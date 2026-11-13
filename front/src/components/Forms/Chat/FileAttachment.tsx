"use client";

import ChestIcon from "@/components/Icons/ChestIcon";
import Pennon from "@/components/ui/Pennon";
import { cn } from "@/library/utils";
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

  const content = (
    <Pennon
      tone={received ? "plain" : "moon"}
      notch={received ? "end" : "start"}
      className={cn(
        "flex items-center gap-2.5 py-2 text-left",
        received ? "pr-6.5 pl-3" : "pr-3 pl-6.5",
      )}
    >
      <ChestIcon className="size-6.5 shrink-0" />
      <span className="grid min-w-0">
        {isTruncated ? (
          <span className="text-base font-semibold" title={file.fileName}>
            {displayName}
          </span>
        ) : (
          <span className="text-base font-semibold">{displayName}</span>
        )}
        <span className="text-ash text-caption font-mono">
          {formattedFileSize}
        </span>
      </span>
    </Pennon>
  );

  if (!file.fileUrl) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      aria-label={`Download ${file.fileName}`}
      className="cursor-pointer"
    >
      {content}
    </button>
  );
}
