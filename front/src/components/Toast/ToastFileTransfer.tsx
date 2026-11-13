import { Icon } from "@/components/Icons/Icon";
import Pennon from "@/components/ui/Pennon";
import ProgressBar from "@/components/ui/ProgressBar";
import { getTruncatedFileName } from "@/utils/file.utils";

interface ToastFileTransferProps {
  fileName: string;
  progress: number; // 0-100
}

export default function ToastFileTransfer({
  fileName,
  progress,
}: ToastFileTransferProps) {
  const { displayName, isTruncated } = getTruncatedFileName(fileName, 25);

  return (
    <Pennon
      tone="moon"
      className="pointer-events-auto grid w-80 max-w-full gap-2 py-2.5 pr-7 pl-3.5 text-base leading-snug"
    >
      <span className="flex items-center gap-2.5">
        <Icon.downloadAnimated className="text-moon shrink-0 text-lg" />
        <span className="min-w-0">
          Receiving file
          <span
            className="text-ash block truncate font-mono text-xs"
            title={isTruncated ? fileName : undefined}
          >
            {displayName}
          </span>
        </span>
      </span>
      <ProgressBar value={progress} label={`Receiving ${fileName}`} />
    </Pennon>
  );
}
