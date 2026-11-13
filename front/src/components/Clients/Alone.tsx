import StatusLine from "../ui/StatusLine";

interface AloneProps {
  isConnecting: boolean;
}

export default function Alone({ isConnecting }: AloneProps) {
  return (
    <StatusLine
      title={isConnecting ? "Connecting..." : "You are alone"}
      detail={
        isConnecting
          ? "Can't reach the drop-to.me server yet. Retrying..."
          : "Waiting for someone to join your network"
      }
    />
  );
}
