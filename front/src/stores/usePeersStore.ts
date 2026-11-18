import { create } from "zustand";
import type { TDevice } from "@/schemas/device.schema";
import type { TPeer } from "@/types/peer.t";
import type { TPeerChannel } from "@/types/peerChannel.t";

interface PeerUpdate {
  channel?: TPeerChannel | null;
  isReachable?: boolean;
  isSending?: boolean;
  isReceiving?: boolean;
  device?: TDevice;
  sendProgress?: number;
}

interface PeersStore {
  targetPeers: TPeer[];
  addTargetPeer: (peerId: string) => void;
  removeTargetPeer: (peerId: string) => void;
  clearTargetPeers: () => void;
  updatePeer: (peerId: string, updates: PeerUpdate) => void;
}

export const usePeersStore = create<PeersStore>((set) => ({
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
            channel: null,
            isReachable: false,
            isSending: false,
            isReceiving: false,
          },
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

export const findTargetPeer = (peerId: string): TPeer | undefined =>
  usePeersStore.getState().targetPeers.find((peer) => peer.peerId === peerId);

export const selectHasReachablePeer = (state: PeersStore): boolean =>
  state.targetPeers.some((peer) => peer.isReachable);
