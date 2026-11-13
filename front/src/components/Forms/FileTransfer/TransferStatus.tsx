import ProgressBar from "@/components/ui/ProgressBar";
import StatusLine from "@/components/ui/StatusLine";
import type { TTransferPhase } from "@/types/file.t";
import { getTruncatedFileName } from "@/utils/file.utils";
import styles from "./TransferStatus.module.css";

interface TransferStatusProps {
  phase: TTransferPhase;
  peerCount: number;
  connectedCount: number;
  waitingMessage: string;
  fileName: string;
  progress: number;
  onDoneShown: () => void;
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
  phase,
  peerCount,
  connectedCount,
  waitingMessage,
  fileName,
  progress,
  onDoneShown,
}: TransferStatusProps) {
  switch (phase) {
    case "idle":
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
    case "drag":
      return <StatusLine title="Release the files to send them" />;
    case "waiting":
      return <StatusLine title={waitingMessage} />;
    case "sending": {
      const { displayName, isTruncated } = getTruncatedFileName(fileName, 25);
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
              <span title={isTruncated ? fileName : undefined}>
                {displayName}
              </span>
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
    case "done":
      return (
        <div className={styles.passing} onAnimationEnd={onDoneShown}>
          <StatusLine title="File transfer completed successfully" />
        </div>
      );
  }
}
