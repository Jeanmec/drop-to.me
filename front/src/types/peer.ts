import type { DataConnection } from "peerjs";

export interface SelfPeer {
  peerId: string;
  connection?: DataConnection;
}

export type TargetPeerState = "none" | "connecting" | "open" | "closed";

export interface TargetPeer {
  peerId: string;
  connection?: DataConnection | null;
  state: "connecting" | "open" | "closed" | "none";
}
