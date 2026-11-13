import { create } from "zustand";
import type { Peer, DataConnection } from "peerjs";
import type { TDevice, TPeer, TReceivingFile } from "@/types/peer.t";

interface PeerUpdate {
  connection?: DataConnection | null;
  isReachable?: boolean;
  isSending?: boolean;
  isReceiving?: boolean;
  receivingFile?: TReceivingFile;
  device?: TDevice;
  sendProgress?: number;
}

interface PeersStore {
  selfPeer: Peer | null;
  setSelfPeer: (peer: Peer | null) => void;

  isPeerDisconnected: boolean;
  setIsPeerDisconnected: (disconnected: boolean) => void;

  targetPeers: TPeer[];
  addTargetPeer: (peerId: string) => void;
  removeTargetPeer: (peerId: string) => void;
  clearTargetPeers: () => void;
  updatePeer: (peerId: string, updates: PeerUpdate) => void;
}

export const usePeersStore = create<PeersStore>((set) => ({
  selfPeer: null,

  setSelfPeer: (peer) => set({ selfPeer: peer }),

  isPeerDisconnected: false,

  setIsPeerDisconnected: (disconnected) =>
    set({ isPeerDisconnected: disconnected }),

  targetPeers: [],

  addTargetPeer: (peerId) =>
    set((state) => {
      if (state.targetPeers.some((peer) => peer.peerId === peerId)) {
        return state;
      }

      return {
        targetPeers: [
          ...state.targetPeers,
          {
            peerId,
            connection: null,
            isReachable: false,
            isSending: false,
            isReceiving: false,
          },
        ],
      };
    }),

  removeTargetPeer: (peerId) =>
    set((state) => ({
      targetPeers: state.targetPeers.filter((p) => p.peerId !== peerId),
    })),

  clearTargetPeers: () => set({ targetPeers: [] }),

  updatePeer: (peerId, updates) =>
    set((state) => ({
      targetPeers: state.targetPeers.map((peer) =>
        peer.peerId === peerId ? { ...peer, ...updates } : peer,
      ),
    })),
}));
