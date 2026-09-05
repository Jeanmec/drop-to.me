import { create } from "zustand";
import type { Peer, DataConnection } from "peerjs";
import type { TPeer } from "@/types/peer.t";
import { notify } from "@/library/toastService";

interface PeersStore {
  selfPeer: Peer | null;
  setSelfPeer: (peer: Peer | null) => void;

  isPeerDisconnected: boolean;
  setIsPeerDisconnected: (disconnected: boolean) => void;

  targetPeers: TPeer[];
  addTargetPeer: (peerId: string, connection?: DataConnection) => void;
  removeTargetPeer: (peerId: string) => void;
  clearTargetPeers: () => void;
  detachConnections: () => void;
  updatePeer: (
    peerId: string,
    updates: Partial<
      Pick<TPeer, "isSending" | "isReceiving" | "connection" | "receivingFile">
    >,
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
      const existingPeer = state.targetPeers.find(
        (peer) => peer.peerId === peerId,
      );

      if (existingPeer) {
        if (!connection || existingPeer.connection === connection) {
          return state;
        }

        return {
          targetPeers: state.targetPeers.map((peer) =>
            peer.peerId === peerId ? { ...peer, connection } : peer,
          ),
        };
      }

      return {
        targetPeers: [
          ...state.targetPeers,
          {
            peerId,
            connection: connection ?? null,
            isSending: false,
            isReceiving: false,
          },
        ],
      };
    }),

  removeTargetPeer: (peerId) =>
    set((state) => {
      const peer = state.targetPeers.find((p) => p.peerId === peerId);
      if (peer?.connection?.open) {
        peer.connection.close();
      }
      return {
        targetPeers: state.targetPeers.filter((p) => p.peerId !== peerId),
      };
    }),

  clearTargetPeers: () =>
    set((state) => {
      state.targetPeers.forEach((peer) => {
        if (peer.connection?.open) {
          peer.connection.close();
        }
      });
      return { targetPeers: [] };
    }),

  detachConnections: () =>
    set((state) => ({
      targetPeers: state.targetPeers.map((peer) => {
        if (peer.connection && !peer.connection.open) {
          try {
            peer.connection.close();
          } catch {
            // ignore — connection already torn down
          }
        }
        if (peer.receivingFile?.toastId) {
          notify.updateToFailed(
            peer.receivingFile.toastId,
            peer.receivingFile.name,
            false,
          );
        }
        return {
          ...peer,
          connection: null,
          isSending: false,
          isReceiving: false,
          receivingFile: undefined,
        };
      }),
    })),

  updatePeer: (peerId, updates) =>
    set((state) => ({
      targetPeers: state.targetPeers.map((peer) =>
        peer.peerId === peerId ? { ...peer, ...updates } : peer,
      ),
    })),
}));
