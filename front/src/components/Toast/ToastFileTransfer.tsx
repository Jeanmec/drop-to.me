import { Icon } from "@/components/Icons/Icon";
import { getTruncatedFileName } from "@/utils/file.utils";

interface ToastFileTransferProps {
  fileName: string;
  progress: number; // 0-100
  isUploading: boolean; // true = upload, false = download
  isFailed?: boolean;
}

export default function ToastFileTransfer({
  fileName,
  progress,
  isUploading,
  isFailed = false,
}: ToastFileTransferProps) {
  const { displayName, isTruncated } = getTruncatedFileName(fileName, 25);

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-full p-2 text-xl text-white ${
            isFailed ? "bg-red-500" : "bg-primary-blue"
          }`}
        >
          {isFailed ? (
            <Icon.close />
          ) : isUploading ? (
            <Icon.uploadAnimated />
          ) : (
            <Icon.downloadAnimated />
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            {isFailed
              ? `Failed ${isUploading ? "sending" : "reception"}`
              : `${isUploading ? "Sending" : "Receiving"} file`}
          </div>
          {isTruncated ? (
            <div className="text-xs text-gray-300" title={fileName}>
              {displayName}
            </div>
          ) : (
            <div className="text-xs text-gray-300">{displayName}</div>
          )}
        </div>
      </div>

      {!isFailed && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className="bg-primary-blue h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
