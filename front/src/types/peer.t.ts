import type { DataConnection } from "peerjs";

export interface SelfPeer {
  peerId: string;
  connection?: DataConnection;
}

export type TargetPeerState =
  | "none"
  | "connecting"
  | "open"
  | "closed"
  | "sending"
  | "delivered";

export interface TargetPeer {
  peerId: string;
  connection?: DataConnection | null;
  state: TargetPeerState;
}

export type GlobalPeersState = "connected" | "disconnected";
