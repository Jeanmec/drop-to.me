import clsx from "clsx";
import ChestIcon from "@/components/Icons/ChestIcon";
import type { TMessageFile } from "@/types/message.t";
import { formatFileSize, getTruncatedFileName } from "@/utils/file.utils";

const ATTACHMENT_NAME_MAX_LENGTH = 20;

interface FileAttachmentProps {
  file: TMessageFile;
  isReceived: boolean;
}

export default function FileAttachment({
  file,
  isReceived,
}: FileAttachmentProps) {
  const { displayName, isTruncated } = getTruncatedFileName(
    file.fileName,
    ATTACHMENT_NAME_MAX_LENGTH,
  );
  const className = clsx(
    "flex items-center gap-2.5 border px-3 py-2 text-left",
    isReceived ? "border-cream" : "border-moon",
  );
  const content = (
    <>
      <ChestIcon className="size-6.5 shrink-0" />
      <span className="grid min-w-0">
        <span
          className="text-base font-semibold"
          title={isTruncated ? file.fileName : undefined}
        >
          {displayName}
        </span>
        <span className="text-ash text-caption font-mono">
          {formatFileSize(file.fileSize)}
        </span>
      </span>
    </>
  );

  if (!file.fileUrl) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      href={file.fileUrl}
      download={file.fileName}
      aria-label={`Download ${file.fileName}`}
      className={className}
    >
      {content}
    </a>
  );
}
