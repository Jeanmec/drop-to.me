export const formatFileSize = (bytes: number): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 3,
  });

  if (bytes >= 1024 ** 3) {
    return `${formatter.format(bytes / 1024 ** 3)} GB`;
  } else if (bytes >= 1024 ** 2) {
    return `${formatter.format(bytes / 1024 ** 2)} MB`;
  } else if (bytes >= 1024) {
    return `${formatter.format(bytes / 1024)} KB`;
  }
  return `${formatter.format(bytes)} B`;
};

export const getTruncatedFileName = (
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
