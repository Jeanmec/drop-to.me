const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];
const FILE_SIZE_STEP = 1024;
const ELLIPSIS = "…";
const FILE_NAME_MAX_LENGTH = 25;

const fileSizeFormatter = new Intl.NumberFormat(undefined, {
  maximumSignificantDigits: 3,
});

interface FileSizeParts {
  value: number;
  unit: string;
}

interface FileNameParts {
  baseName: string;
  extension: string;
}

interface TruncatedFileName {
  displayName: string;
  isTruncated: boolean;
}

export const splitFileSize = (bytes: number): FileSizeParts => {
  let value = bytes;
  let unitIndex = 0;

  while (value >= FILE_SIZE_STEP && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= FILE_SIZE_STEP;
    unitIndex += 1;
  }

  return { value, unit: FILE_SIZE_UNITS[unitIndex] };
};

export const formatFileSize = (bytes: number): string => {
  const { value, unit } = splitFileSize(bytes);
  return `${fileSizeFormatter.format(value)} ${unit}`;
};

// ".env" has no extension
export const splitFileName = (fileName: string): FileNameParts => {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return { baseName: fileName, extension: "" };
  }
  return {
    baseName: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex),
  };
};

export const getTruncatedFileName = (
  fileName: string,
  maxLength = FILE_NAME_MAX_LENGTH,
): TruncatedFileName => {
  const { baseName, extension } = splitFileName(fileName);
  const allowedLength = maxLength - extension.length;

  if (fileName.length <= maxLength || allowedLength <= 0) {
    return { displayName: fileName, isTruncated: false };
  }
  return {
    displayName: baseName.slice(0, allowedLength - 1) + ELLIPSIS + extension,
    isTruncated: true,
  };
};
