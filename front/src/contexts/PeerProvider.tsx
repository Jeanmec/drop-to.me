"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Peer, { type DataConnection } from "peerjs";
import { usePeersStore } from "@/stores/usePeersStore";
import {
  createPeerInstance,
  setPeerInstance,
  getPeerInstance,
  handleIncomingData,
  cancelTransfersForPeer,
} from "@/services/peerService";
import { notify } from "@/library/toastService";

interface PeerProviderProps {
  children: ReactNode;
}

interface PeerContextValue {
  peer: Peer | null;
}

const PeerContext = createContext<PeerContextValue | null>(null);

const setupConnectionListeners = (
  conn: DataConnection,
  onOpen?: () => void,
) => {
  conn.on("open", () => {
    if (onOpen) onOpen();
    usePeersStore.getState().addTargetPeer(conn.peer, conn);
  });

  conn.on("data", (data: unknown) => {
    handleIncomingData(data, conn.peer, conn);
  });

  conn.on("close", () => {
    cancelTransfersForPeer(conn.peer);
    usePeersStore.getState().removeTargetPeer(conn.peer);
  });

  conn.on("error", () => {
    cancelTransfersForPeer(conn.peer);
    usePeersStore.getState().removeTargetPeer(conn.peer);
  });
};

const attemptPeerReconnect = (peer: Peer) => {
  if (!peer.destroyed) {
    try {
      peer.reconnect();
    } catch (reconnectError) {
      console.error("[PeerProvider] Reconnect error:", reconnectError);
    }
  }
};

export function PeerProvider({ children }: PeerProviderProps) {
  const [localPeerInstance, setLocalPeerInstance] = useState<Peer | null>(null);
  const {
    setSelfPeer,
    targetPeers,
    updatePeer,
    clearTargetPeers,
    setIsPeerDisconnected,
    isPeerDisconnected,
  } = usePeersStore();

  useEffect(() => {
    if (isPeerDisconnected) return;

    clearTargetPeers();

    let peer = getPeerInstance();
    if (!peer || peer.destroyed) {
      peer = createPeerInstance();
      setPeerInstance(peer);
    }

    const newPeer = peer;

    newPeer.on("open", () => {
      setSelfPeer(newPeer);
      setLocalPeerInstance(newPeer);
    });
    newPeer.on("error", (err) => {
      console.error("[PeerProvider] Error:", err);

      if (err.type === "disconnected" || err.type === "network") {
        if (newPeer.disconnected) {
          attemptPeerReconnect(newPeer);
        }
        return;
      }

      if (err.type === "peer-unavailable") {
        return;
      }

      setIsPeerDisconnected(true);
      setSelfPeer(null);
      notify.error("PeerJS error: " + err.type, false);
    });

    newPeer.on("disconnected", () => {
      attemptPeerReconnect(newPeer);
    });

    newPeer.on("connection", (conn: DataConnection) => {
      if (!conn) return;
      setupConnectionListeners(conn);
    });
    return () => {
      newPeer.destroy();
    };
  }, [
    setSelfPeer,
    clearTargetPeers,
    setIsPeerDisconnected,
    isPeerDisconnected,
  ]);

  useEffect(() => {
    if (!localPeerInstance || isPeerDisconnected) return;

    targetPeers.forEach((peer) => {
      if (!peer.connection && localPeerInstance.id !== peer.peerId) {
        const conn = localPeerInstance.connect(peer.peerId);

        if (!conn) {
          return;
        }

        setupConnectionListeners(conn, () => {
          updatePeer(peer.peerId, { connection: conn });
        });
      }
    });
  }, [localPeerInstance, targetPeers, updatePeer, isPeerDisconnected]);

  return (
    <PeerContext.Provider value={{ peer: localPeerInstance }}>
      {children}
    </PeerContext.Provider>
  );
}

export function usePeer() {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
}
