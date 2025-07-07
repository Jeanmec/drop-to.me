import type { DataConnection } from "peerjs";

export interface SelfPeer {
  peerId: string;
  connection?: DataConnection;
}

export type TTargetPeerState =
  | "none"
  | "connecting"
  | "open"
  | "closed"
  | "sending"
  | "delivered";

export type TTargetPeer = {
  peerId: string;
  connection?: DataConnection | null;
  state: TTargetPeerState;
};

export type GlobalPeersState = "connected" | "disconnected";
