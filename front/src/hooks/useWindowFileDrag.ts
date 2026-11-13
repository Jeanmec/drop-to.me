import { useEffect } from "react";
import { useDragFileStore } from "@/stores/useDragFileStore";

export function useWindowFileDrag(isActive: boolean): void {
  const setIsDragFileActive = useDragFileStore(
    (state) => state.setIsDragFileActive,
  );

  useEffect(() => {
    if (!isActive) {
      setIsDragFileActive(false);
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isActive && e.dataTransfer?.types.includes("Files")) {
        setIsDragFileActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget === null || e.target === document.body) {
        setIsDragFileActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragFileActive(false);
    };

    const preventDefaults = (e: DragEvent) => e.preventDefault();

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", preventDefaults);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", preventDefaults);
    };
  }, [setIsDragFileActive, isActive]);
}
