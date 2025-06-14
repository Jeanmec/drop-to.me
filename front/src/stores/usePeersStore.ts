// src/stores/usePeersStore.ts
import { create } from "zustand";
import type { DataConnection, Peer } from "peerjs";
import type { TargetPeer, TargetPeerState } from "@/app/types/peer.t";

interface PeersStore {
  selfPeer: Peer | null;
  targetPeers: TargetPeer[];
  setSelfPeer: (peer: Peer) => void;
  addTargetPeer: (peer: { peerId: string; state?: TargetPeerState }) => void;
  removeTargetPeer: (peerId: string) => void;
  updateTargetConnection: (connection: DataConnection) => void;
  updatePeerState: (peerId: string, stateValue: TargetPeerState) => void;
}

export const usePeersStore = create<PeersStore>((set) => ({
  selfPeer: null,
  targetPeers: [],
  setSelfPeer: (peer) => set(() => ({ selfPeer: peer })),

  addTargetPeer: ({ peerId, state = "none" }) =>
    set((storeState) => {
      if (storeState.targetPeers.some((p) => p.peerId === peerId)) {
        return storeState;
      }
      return {
        targetPeers: [
          ...storeState.targetPeers,
          { peerId, connection: null, state },
        ],
      };
    }),

  removeTargetPeer: (peerId) =>
    set((state) => ({
      targetPeers: state.targetPeers.filter((p) => p.peerId !== peerId),
    })),

  updateTargetConnection: (conn) =>
    set((state) => ({
      targetPeers: state.targetPeers.map((p) =>
        p.peerId === conn.peer ? { ...p, connection: conn, state: "open" } : p,
      ),
    })),

  updatePeerState: (peerId, stateValue) =>
    set((state) => ({
      targetPeers: state.targetPeers.map((p) =>
        p.peerId === peerId ? { ...p, state: stateValue } : p,
      ),
    })),
}));
