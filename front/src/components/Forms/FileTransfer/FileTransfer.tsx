"use client";

import Alone from "@/components/Session/Alone";
import GlobalFileDropzone from "@/components/Forms/FileTransfer/GlobalFileDropzone";
import InputFile from "@/components/Forms/FileTransfer/InputFile";
import TransferStatus from "@/components/Forms/FileTransfer/TransferStatus";
import { useScreenWakeLock } from "@/hooks/useScreenWakeLock";
import { sendFiles } from "@/services/transferService";
import { usePeersStore } from "@/stores/usePeersStore";
import {
  selectIsTransferLocked,
  useTransferStore,
} from "@/stores/useTransferStore";
import { TransferPhase } from "@/types/transfer.t";

interface FileTransferProps {
  isActive: boolean;
  isDropTarget: boolean;
  isConnecting: boolean;
}

const sendLabelOf = (phase: TransferPhase, isDropping: boolean): string => {
  if (isDropping) {
    return "Drop to send";
  }
  switch (phase) {
    case TransferPhase.ZIPPING:
    case TransferPhase.WAITING:
    case TransferPhase.SENDING:
      return "Sending file";
    case TransferPhase.IDLE:
    case TransferPhase.DONE:
      return "Send files";
  }
};

const handleFilesSelected = (files: File[]): void => {
  void sendFiles(files);
};

// Stays mounted while the user is alone: unmounting would detach the file input
// while the native picker is open (Android backgrounds the page), losing the selection.
export default function FileTransfer({
  isActive,
  isDropTarget,
  isConnecting,
}: FileTransferProps) {
  const targetPeers = usePeersStore((state) => state.targetPeers);
  const phase = useTransferStore((state) => state.phase);
  const isTransferLocked = useTransferStore(selectIsTransferLocked);
  const isDropping = isDropTarget && !isTransferLocked;
  useScreenWakeLock(
    targetPeers.some((peer) => peer.isSending || peer.isReceiving),
  );

  return (
    <>
      <GlobalFileDropzone
        onFilesSelected={handleFilesSelected}
        disabled={isTransferLocked || !isActive}
        isDropTarget={isDropTarget}
      />
      <InputFile
        onFilesSelected={handleFilesSelected}
        disabled={isTransferLocked}
        hasNoRecipient={!isActive}
        isDropTarget={isDropping}
        label={sendLabelOf(phase, isDropping)}
      />
      <div role="status" className="grid justify-items-center gap-2">
        {phase === TransferPhase.IDLE && !isActive ? (
          <Alone isConnecting={isConnecting} />
        ) : (
          <TransferStatus
            isDropping={isDropping}
            peerCount={targetPeers.length}
            connectedCount={
              targetPeers.filter((peer) => peer.isReachable).length
            }
          />
        )}
      </div>
    </>
  );
}
