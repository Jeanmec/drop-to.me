import AnimationTimer from "@/components/ui/AnimationTimer";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusLine from "@/components/ui/StatusLine";
import { giveUpWaiting } from "@/services/transferService";
import { useTransferStore } from "@/stores/useTransferStore";
import { TransferPhase } from "@/types/transfer.t";
import { getTruncatedFileName } from "@/utils/file.utils";
import { formatRemainingTime } from "@/utils/time.utils";

interface TransferStatusProps {
  isDropping: boolean;
  peerCount: number;
  connectedCount: number;
}

const describePeers = (peerCount: number, connectedCount: number): string => {
  if (connectedCount === 0) {
    return peerCount === 1
      ? "Connecting to your peer..."
      : "Connecting to your peers...";
  }
  return connectedCount === 1
    ? "1 device connected"
    : `${connectedCount} devices connected`;
};

export default function TransferStatus({
  isDropping,
  peerCount,
  connectedCount,
}: TransferStatusProps) {
  const {
    phase,
    zippedFileCount,
    waitingMessage,
    fileName,
    progress,
    remainingSeconds,
    reset,
  } = useTransferStore();

  if (isDropping) {
    return <StatusLine title="Release the files to send them" />;
  }

  switch (phase) {
    case TransferPhase.IDLE:
      return (
        <StatusLine
          title={describePeers(peerCount, connectedCount)}
          detail={
            connectedCount > 0 && (
              <>
                <span className="pointer-coarse:hidden">
                  Click the button, or drop files anywhere
                </span>
                <span className="pointer-fine:hidden">
                  Tap the button to choose files
                </span>
              </>
            )
          }
        />
      );
    case TransferPhase.ZIPPING:
      return <StatusLine title={`Zipping ${zippedFileCount} files...`} />;
    case TransferPhase.WAITING:
      return (
        <>
          <StatusLine title={waitingMessage} />
          <AnimationTimer
            className="animate-peer-wait"
            onElapsed={giveUpWaiting}
          />
        </>
      );
    case TransferPhase.SENDING: {
      const { displayName, isTruncated } = getTruncatedFileName(fileName);
      return (
        <>
          <StatusLine
            title={
              <>
                Sending{" "}
                <em className="text-moon" aria-hidden>
                  {progress}%
                </em>
              </>
            }
            detail={
              <>
                <span title={isTruncated ? fileName : undefined}>
                  {displayName}
                </span>
                {remainingSeconds !== null && (
                  <span aria-hidden>
                    {" "}
                    · about {formatRemainingTime(remainingSeconds)} left
                  </span>
                )}
              </>
            }
          />
          <ProgressBar
            value={progress}
            label="Sending progress"
            className="w-full max-w-80"
          />
        </>
      );
    }
    case TransferPhase.DONE:
      return (
        <div className="animate-pass" onAnimationEnd={reset}>
          <StatusLine title="File transfer completed successfully" />
        </div>
      );
  }
}
