import type { DataConnection } from "peerjs";

export type PeerState = "connected" | "disconnected" | "sending";

export type TPeer = {
  peerId: string;
  connection: DataConnection | null;
  state: "connected" | "sending";
};
