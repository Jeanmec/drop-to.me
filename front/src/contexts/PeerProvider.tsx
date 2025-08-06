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
import { notify } from "@/library/toastService";

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
    setGlobalPeersState,
  } = usePeersStore();

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on("open", (id) => {
      setSelfPeer(newPeer);
      setPeerInstance(newPeer);
    });

    newPeer.on("error", (err) => {
      if (err.type === "network") {
        setGlobalPeersState("disconnected");
        notify.error("You have been disconnected. Try reloading the page.", {
          autoClose: false,
        });
      } else if (err.type === "server-error") {
        setGlobalPeersState("disconnected");
        notify.error("Server error. Check your connection or try later.", {
          autoClose: false,
        });
      }
    });

    return () => {
      newPeer.destroy();
    };
  }, [removeTargetPeer, setGlobalPeersState, setSelfPeer]);

  const setupConnectionListeners = useCallback(
    (conn?: DataConnection) => {
      if (!conn) return;

      conn.on("open", () => {
        updateTargetConnection(conn);
      });

      conn.on("data", (data: unknown) => {
        peerService.handleIncomingData(data, conn.peer);
      });

      conn.on("close", () => {
        removeTargetPeer(conn.peer);
      });

      conn.on("error", () => {
        removeTargetPeer(conn.peer);
      });
    },
    [updateTargetConnection, removeTargetPeer],
  );

  useEffect(() => {
    if (!peerInstance) return;

    const handleIncomingConnection = (conn: DataConnection) => {
      if (!conn) return;

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

      const newConn = peerInstance.connect(targetId);

      if (!newConn) {
        console.warn(`Connection to ${targetId} failed or returned undefined`);
        return;
      }

      updatePeerState(targetId, "connecting");
      setupConnectionListeners(newConn);
    });
  }, [peerInstance, targetPeers, setupConnectionListeners, updatePeerState]);

  return (
    <PeerContext.Provider value={peerInstance}>{children}</PeerContext.Provider>
  );
}
