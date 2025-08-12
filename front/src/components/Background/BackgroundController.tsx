import { useTabStore } from "@/stores/useTabStore";
import { usePeersStore } from "@/stores/usePeersStore";
import BackgroundRadar from "@/components/Background/BackgroundRadar";
import { useDragFileStore } from "@/stores/useDragFileStore";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function BackgroundController() {
  const { background } = useTabStore();

  const { globalPeersState } = usePeersStore();

  const { setIsDragFileActive } = useDragFileStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] ?? null;
    console.log("Dropped file:", file);
    if (file) {
      console.log("Dropped file:", file);
    }
  }, []);

  const { getRootProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setIsDragFileActive(true),
    onDragLeave: () => setIsDragFileActive(false),
    onDropAccepted: () => setIsDragFileActive(false),
  });

  useEffect(() => {}, [setIsDragFileActive]);

  return (
    <div {...getRootProps()}>
      {globalPeersState === "connected" ? background : <BackgroundRadar />}
    </div>
  );
}
