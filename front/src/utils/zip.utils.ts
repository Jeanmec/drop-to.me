import { downloadZip } from "client-zip";
import { splitFileName } from "@/utils/file.utils";
import { formatFileTimestamp } from "@/utils/time.utils";

const ZIP_MIME_TYPE = "application/zip";

const uniqueEntryName = (fileName: string, usedNames: Set<string>): string => {
  const { baseName, extension } = splitFileName(fileName);
  let entryName = fileName;
  let duplicateCount = 0;

  while (usedNames.has(entryName)) {
    duplicateCount += 1;
    entryName = `${baseName} (${duplicateCount})${extension}`;
  }
  return entryName;
};

export const createZipFromFiles = async (files: File[]): Promise<File> => {
  const usedNames = new Set<string>();
  const entries = files.map((file) => {
    const name = uniqueEntryName(file.name, usedNames);
    usedNames.add(name);
    return { name, input: file };
  });

  // the entries are stored uncompressed and streamed into a Blob the browser keeps
  const archive = await downloadZip(entries).blob();

  return new File(
    [archive],
    `drop-${files.length}-files-${formatFileTimestamp(new Date())}.zip`,
    { type: ZIP_MIME_TYPE },
  );
};
