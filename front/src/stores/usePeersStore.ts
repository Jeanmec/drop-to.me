import { create } from "zustand";
import type { Peer, DataConnection } from "peerjs";
import type { TPeer } from "@/types/peer.t";

interface PeersStore {
  // Self peer
  selfPeer: Peer | null;
  setSelfPeer: (peer: Peer | null) => void;

  isPeerDisconnected: boolean;
  setIsPeerDisconnected: (disconnected: boolean) => void;

  // Target peers
  targetPeers: TPeer[];
  addTargetPeer: (peerId: string, connection?: DataConnection) => void;
  removeTargetPeer: (peerId: string) => void;
  clearTargetPeers: () => void;
  updatePeer: (
    peerId: string,
    updates: Partial<Pick<TPeer, "state" | "connection">>,
  ) => void;
}

export const usePeersStore = create<PeersStore>((set) => ({
  selfPeer: null,

  setSelfPeer: (peer) => set({ selfPeer: peer }),

  isPeerDisconnected: false,

  setIsPeerDisconnected: (disconnected) =>
    set({ isPeerDisconnected: disconnected }),

  targetPeers: [],

  addTargetPeer: (peerId, connection) =>
    set((state) => {
      if (state.targetPeers.some((peer) => peer.peerId === peerId)) {
        return state;
      }
      return {
        targetPeers: [
          ...state.targetPeers,
          { peerId, connection: connection ?? null, state: "connected" },
        ],
      };
    }),

  removeTargetPeer: (peerId) =>
    set((state) => ({
      targetPeers: state.targetPeers.filter((peer) => peer.peerId !== peerId),
    })),

  clearTargetPeers: () => set({ targetPeers: [] }),

  updatePeer: (peerId, updates) =>
    set((state) => ({
      targetPeers: state.targetPeers.map((peer) =>
        peer.peerId === peerId ? { ...peer, ...updates } : peer,
      ),
    })),
}));
