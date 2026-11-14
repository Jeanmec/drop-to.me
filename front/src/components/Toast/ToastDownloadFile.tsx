import Icon from "@/components/Icons/Icon";
import CloseButton from "@/components/ui/CloseButton";
import Pennon from "@/components/ui/Pennon";
import { PennonTone } from "@/types/ui.t";
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
  const { displayName, isTruncated } = getTruncatedFileName(fileName);

  return (
    <Pennon
      tone={PennonTone.MOON}
      className="ml-auto flex w-80 max-w-full items-center gap-2 py-1.5 pr-5 pl-3.5 font-serif text-base leading-snug"
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

      <CloseButton
        label="Close notification"
        onClick={onDismiss}
        className="-mr-2 shrink-0"
      />
    </Pennon>
  );
}
