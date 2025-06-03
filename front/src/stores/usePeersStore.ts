import { create } from "zustand";

export interface PeersStore {
  Peers: string[];
  addPeer: (peerId: string) => void;
  removePeer: (peerId: string) => void;
}

export const usePeersStore = create<PeersStore>()((set) => ({
  Peers: [],
  addPeer: (peerId: string) =>
    set((state) => ({
      Peers: [...state.Peers, peerId],
    })),
  removePeer: (peerId: string) =>
    set((state) => ({
      Peers: state.Peers.filter((id) => id !== peerId),
    })),
}));
