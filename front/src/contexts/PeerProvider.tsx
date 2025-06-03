// src/contexts/PeerProvider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import Peer, { type DataConnection } from "peerjs";
import { usePeersStore } from "@/stores/usePeersStore";

interface PeerContextValue {
  peer: Peer | null;
  peerId: string;
  connections: Record<string, DataConnection>;
  connectTo: (peerId: string) => DataConnection | null;
}

const PeerContext = createContext<PeerContextValue | null>(null);

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
  const [peerId, setPeerId] = useState("");
  const [connections, setConnections] = useState<
    Record<string, DataConnection>
  >({});
  const peerRef = useRef<Peer | null>(null);

  const addPeer = usePeersStore((state) => state.addPeer);
  const removePeer = usePeersStore((state) => state.removePeer);

  useEffect(() => {
    const peer = new Peer({ secure: true });
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      setConnections((prev) => ({ ...prev, [conn.peer]: conn }));
      addPeer(conn.peer);

      conn.on("close", () => {
        setConnections((prev) => {
          const updated = { ...prev };
          delete updated[conn.peer];
          return updated;
        });
        removePeer(conn.peer);
      });
    });

    return () => {
      peer.destroy();
    };
  }, [addPeer, removePeer]);

  const connectTo = useCallback(
    (peerId: string): DataConnection | null => {
      const peer = peerRef.current;
      if (!peer || connections[peerId]) return connections[peerId] ?? null;

      const conn = peer.connect(peerId);
      setConnections((prev) => ({ ...prev, [peerId]: conn }));
      addPeer(peerId);

      conn.on("close", () => {
        setConnections((prev) => {
          const updated = { ...prev };
          delete updated[peerId];
          return updated;
        });
        removePeer(peerId);
      });

      return conn;
    },
    [connections, addPeer, removePeer],
  );

  return (
    <PeerContext.Provider
      value={{
        peer: peerRef.current,
        peerId,
        connections,
        connectTo,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => {
  const ctx = useContext(PeerContext);
  if (!ctx) throw new Error("usePeer must be used within a PeerProvider");
  return ctx;
};
