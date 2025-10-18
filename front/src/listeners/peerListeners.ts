import { onSocket, offSocket } from "@/services/socketService";

interface InitializePeerListenersParams {
  onJoinSuccess: (data: { peers: string[]; ip: string }) => void;
  onPeerLeft: (peerId: string) => void;
  onPeerJoined: (peerId: string) => void;
}

export const initializePeerListeners = ({
  onJoinSuccess,
  onPeerLeft,
  onPeerJoined,
}: InitializePeerListenersParams) => {
  onSocket<{ peers: string[]; ip: string }>("join-success", onJoinSuccess);
  onSocket<string>("peer-left", onPeerLeft);
  onSocket<string>("peer-joined", onPeerJoined);
};

export const cleanupPeerListeners = () => {
  offSocket("join-success");
  offSocket("peer-left");
  offSocket("peer-joined");
};
