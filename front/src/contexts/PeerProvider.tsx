"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Peer, { type DataConnection } from "peerjs";
import { usePeersStore } from "@/stores/usePeersStore";
import { useConnectionStore } from "@/stores/useConnectionStore";
import {
  createPeerInstance,
  setPeerInstance,
  getPeerInstance,
} from "@/services/peerService";
import { getSocket } from "@/services/socketService";
import {
  acceptConnection,
  closeAllConnections,
  closePendingConnectionsNamedIn,
  connectToMissingPeers,
} from "@/services/peerConnections";

interface PeerProviderProps {
  children: ReactNode;
}

interface PeerContextValue {
  peer: Peer | null;
}

const PeerContext = createContext<PeerContextValue | null>(null);

export function PeerProvider({ children }: PeerProviderProps) {
  const [localPeerInstance, setLocalPeerInstance] = useState<Peer | null>(null);
  const [isPeerServerOpen, setIsPeerServerOpen] = useState(false);
  const [peerGeneration, setPeerGeneration] = useState(0);
  const {
    setSelfPeer,
    targetPeers,
    clearTargetPeers,
    setIsPeerDisconnected,
    isPeerDisconnected,
  } = usePeersStore();
  const isSocketConnected = useConnectionStore(
    (state) => state.isSocketConnected,
  );

  useEffect(() => {
    if (isPeerDisconnected) {
      return;
    }

    clearTargetPeers();

    let peer = getPeerInstance();
    if (!peer || peer.destroyed) {
      peer = createPeerInstance();
      setPeerInstance(peer);
    }

    const newPeer = peer;

    newPeer.on("open", () => {
      setIsPeerServerOpen(true);
      setSelfPeer(newPeer);
      setLocalPeerInstance(newPeer);
    });

    newPeer.on("disconnected", () => setIsPeerServerOpen(false));

    newPeer.on("error", (err) => {
      switch (err.type) {
        case "peer-unavailable":
          closePendingConnectionsNamedIn(err.message);
          return;
        case "unavailable-id":
          setPeerGeneration((generation) => generation + 1);
          return;
        case "browser-incompatible":
        case "invalid-id":
        case "invalid-key":
        case "ssl-unavailable":
          setIsPeerDisconnected(true);
          setSelfPeer(null);
      }
    });

    newPeer.on("connection", (conn: DataConnection) =>
      acceptConnection(conn, newPeer.id),
    );

    return () => {
      closeAllConnections();
      newPeer.destroy();
    };
  }, [
    setSelfPeer,
    clearTargetPeers,
    setIsPeerDisconnected,
    isPeerDisconnected,
    peerGeneration,
  ]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isSocketConnected || isPeerDisconnected) {
      return;
    }

    const reconnectToPeerServer = () => {
      const peer = getPeerInstance();
      if (peer?.destroyed) {
        setPeerGeneration((generation) => generation + 1);
      } else if (peer?.disconnected) {
        peer.reconnect();
      }
    };

    reconnectToPeerServer();
    socket.io.on("ping", reconnectToPeerServer);
    return () => {
      socket.io.off("ping", reconnectToPeerServer);
    };
  }, [isSocketConnected, isPeerDisconnected]);

  useEffect(() => {
    if (localPeerInstance && isPeerServerOpen) {
      connectToMissingPeers(localPeerInstance, targetPeers);
    }
  }, [localPeerInstance, isPeerServerOpen, targetPeers]);

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
