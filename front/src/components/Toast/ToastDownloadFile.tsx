import { Icon } from "@/components/Icons/Icon";
import Pennon from "@/components/ui/Pennon";
import { formatFileSize, getTruncatedFileName } from "@/utils/file.utils";

interface ToastDownloadFileProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  onDismiss: () => void;
}

export default function ToastDownloadFile({
  fileUrl,
  fileName,
  fileSize,
  onDismiss,
}: ToastDownloadFileProps) {
  const formattedFileSize = formatFileSize(fileSize);
  const { displayName, isTruncated } = getTruncatedFileName(fileName, 25);

  return (
    <Pennon
      tone="moon"
      className="pointer-events-auto flex w-80 max-w-full items-center gap-2 py-1.5 pr-5 pl-3.5 text-base leading-snug"
    >
      <span className="min-w-0 flex-1">
        You receive a file
        <span className="text-ash flex gap-1.5 font-mono text-xs">
          <span className="truncate" title={isTruncated ? fileName : undefined}>
            {displayName}
          </span>
          <span className="shrink-0">· {formattedFileSize}</span>
        </span>
      </span>

      <a
        href={fileUrl}
        download={fileName}
        onClick={onDismiss}
        aria-label={`Download ${fileName}`}
        className="bg-moon grid size-11 shrink-0 place-items-center rounded-full"
      >
        <Icon.downloadTray className="text-night size-5" />
      </a>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="text-ash hover:text-moon -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center"
      >
        <Icon.close className="size-7 text-current" />
      </button>
    </Pennon>
  );
}
