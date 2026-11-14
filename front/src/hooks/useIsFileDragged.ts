import { useDropzone } from "react-dropzone";

// react-dropzone follows the drag on the document: no root element is needed
export function useIsFileDragged(): boolean {
  return useDropzone().isDragGlobal;
}
