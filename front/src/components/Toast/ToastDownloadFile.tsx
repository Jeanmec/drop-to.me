import { Icon } from "@/components/Icons/Icon";

interface ToastDownloadFileProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export default function ToastDownloadFile({
  fileUrl,
  fileName,
  fileSize,
}: ToastDownloadFileProps) {
  function formatFileSize(size: number): string {
    const formatter = new Intl.NumberFormat("fr-FR", {
      maximumSignificantDigits: 3,
    });

    if (size >= 1024 ** 3) {
      return `${formatter.format(size / 1024 ** 3)} Go`;
    } else if (size >= 1024 ** 2) {
      return `${formatter.format(size / 1024 ** 2)} Mo`;
    } else if (size >= 1024) {
      return `${formatter.format(size / 1024)} Ko`;
    }
    return `${formatter.format(size)} o`;
  }

  function getTruncatedFileName(
    name: string,
    maxLength: number,
  ): { displayName: string; isTruncated: boolean } {
    const lastDotIndex = name.lastIndexOf(".");
    const extension = lastDotIndex !== -1 ? name.slice(lastDotIndex) : "";
    const baseName = lastDotIndex !== -1 ? name.slice(0, lastDotIndex) : name;

    const allowedLength = maxLength - extension.length;

    if (name.length <= maxLength || allowedLength <= 0) {
      return { displayName: name, isTruncated: false };
    }

    const truncatedBase = baseName.slice(0, allowedLength - 1) + "…"; // Add ellipsis
    return {
      displayName: truncatedBase + extension,
      isTruncated: true,
    };
  }

  const formattedFileSize = formatFileSize(fileSize);
  const { displayName, isTruncated } = getTruncatedFileName(fileName, 25);

  return (
    <div className="flex h-full w-full items-center pl-4">
      <div className="flex flex-col justify-center">
        <span className="!text-xl font-bold text-white">
          You receive a file
        </span>
        <span className="text-description text-sm">
          {isTruncated ? (
            <div className="tooltip" data-tip={fileName}>
              <span>{displayName}</span>
            </div>
          ) : (
            <span>{displayName}</span>
          )}
        </span>
      </div>

      <div className="via-primary-blue relative ml-auto h-full w-[1px] bg-gradient-to-t from-transparent to-transparent" />

      <a
        href={fileUrl}
        download={fileName}
        className="group flex flex-col items-center gap-1"
      >
        <span className="bg-primary-blue mx-4 flex cursor-pointer flex-col items-center justify-center rounded-full p-2 text-3xl text-white transition-all duration-200 group-hover:scale-110">
          <Icon.downloadAnimated />
        </span>

        <span className="text-xs">{formattedFileSize}</span>
      </a>
    </div>
  );
}
