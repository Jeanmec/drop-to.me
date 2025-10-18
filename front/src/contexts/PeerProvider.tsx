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
} from "@/services/peerService";
import { notify } from "@/library/toastService";

interface PeerProviderProps {
  children: ReactNode;
}

interface PeerContextValue {
  peer: Peer | null;
}

const PeerContext = createContext<PeerContextValue | null>(null);

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
        setIsPeerDisconnected(true);
        setSelfPeer(null);
        notify.error(
          "Connection lost to PeerJS server. Please refresh your browser.",
          { autoClose: false },
        );
        return;
      }

      if (err.type === "peer-unavailable") {
        return;
      }

      setSelfPeer(null);
      notify.error("PeerJS error: " + err.type, { autoClose: false });
    });
    newPeer.on("connection", (conn: DataConnection) => {
      if (!conn) return;
      conn.on("open", () => {
        usePeersStore.getState().addTargetPeer(conn.peer, conn);
      });
      conn.on("data", (data: unknown) => {
        handleIncomingData(data, conn.peer);
      });
      conn.on("close", () => {
        usePeersStore.getState().removeTargetPeer(conn.peer);
      });
      conn.on("error", () => {
        usePeersStore.getState().removeTargetPeer(conn.peer);
      });
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

        conn.on("open", () => {
          updatePeer(peer.peerId, { connection: conn });
        });

        conn.on("data", (data: unknown) => {
          handleIncomingData(data, conn.peer);
        });

        conn.on("close", () => {
          usePeersStore.getState().removeTargetPeer(conn.peer);
        });

        conn.on("error", () => {
          usePeersStore.getState().removeTargetPeer(conn.peer);
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
