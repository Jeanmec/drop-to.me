// src/contexts/PeerProvider.tsx
"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Peer, { type DataConnection } from "peerjs";
import { usePeersStore } from "@/stores/usePeersStore";
import { peerService } from "@/services/peerService";

interface PeerProviderProps {
  children: ReactNode;
}

export const PeerContext = createContext<Peer | null>(null);

export function PeerProvider({ children }: PeerProviderProps) {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);

  const {
    targetPeers,
    addTargetPeer,
    removeTargetPeer,
    updateTargetConnection,
    updatePeerState,
    setSelfPeer,
  } = usePeersStore();

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on("open", (id) => {
      console.log(
        `[PeerProvider] Mon instance Peer est ouverte avec l'id : ${id}`,
      );
      setSelfPeer(newPeer);
      setPeerInstance(newPeer);
    });

    newPeer.on("error", (err) => {
      console.error("[PeerProvider] Erreur de l'instance Peer :", err);
    });

    return () => {
      newPeer.destroy();
    };
  }, [setSelfPeer]);

  const setupConnectionListeners = useCallback(
    (conn: DataConnection) => {
      conn.on("open", () => {
        console.log(`[PeerProvider] Connexion établie avec ${conn.peer}`);
        updateTargetConnection(conn);
      });

      conn.on("data", (data: unknown) => {
        peerService.handleIncomingData(data, conn.peer);
      });

      conn.on("close", () => {
        console.log(`[PeerProvider] Connexion fermée avec ${conn.peer}`);
        removeTargetPeer(conn.peer);
      });

      conn.on("error", (err) => {
        console.error(
          `[PeerProvider] Erreur de connexion avec ${conn.peer}:`,
          err,
        );
        removeTargetPeer(conn.peer);
      });
    },
    [updateTargetConnection, removeTargetPeer],
  );

  useEffect(() => {
    if (!peerInstance) return;

    const handleIncomingConnection = (conn: DataConnection) => {
      console.log(`[PeerProvider] Connexion entrante de : ${conn.peer}`);
      addTargetPeer({ peerId: conn.peer, state: "connecting" });
      setupConnectionListeners(conn);
    };

    peerInstance.on("connection", handleIncomingConnection);
    return () => {
      peerInstance.off("connection", handleIncomingConnection);
    };
  }, [peerInstance, addTargetPeer, setupConnectionListeners]);

  useEffect(() => {
    if (!peerInstance) return;

    targetPeers.forEach(({ peerId: targetId, connection, state }) => {
      if (
        peerInstance.id === targetId ||
        connection ||
        state === "connecting" ||
        state === "open"
      ) {
        return;
      }

      console.log(`[PeerProvider] Tentative de connexion vers ${targetId}`);
      const newConn = peerInstance.connect(targetId);

      // On met à jour l'état pour ne pas essayer en boucle
      updatePeerState(targetId, "connecting");

      // On attache les mêmes listeners
      setupConnectionListeners(newConn);
    });
  }, [peerInstance, targetPeers, setupConnectionListeners, updatePeerState]);

  return (
    <PeerContext.Provider value={peerInstance}>{children}</PeerContext.Provider>
  );
}
