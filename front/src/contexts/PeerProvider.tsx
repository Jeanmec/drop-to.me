"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Peer, { type DataConnection } from "peerjs";

interface PeerContextValue {
  peer: Peer | null;
  selfPeerId: string;
  connections: Record<string, DataConnection>;
}

const PeerContext = createContext<PeerContextValue | null>(null);

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
  const [selfPeerId, setSelfPeerId] = useState("");
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Record<string, DataConnection>>({});

  useEffect(() => {
    const peer = new Peer({ secure: true });
    peerRef.current = peer;

    peer.on("open", setSelfPeerId);
    peer.on("connection", (conn) => {
      connectionsRef.current[conn.peer] = conn;
    });

    return () => {
      peer.destroy();
    };
  }, []);

  return (
    <PeerContext.Provider
      value={{
        peer: peerRef.current,
        selfPeerId,
        connections: connectionsRef.current,
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
