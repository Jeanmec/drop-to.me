"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
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

const RECONNECT_TOAST_ID = "peer-reconnect";
const RECONNECT_DELAY_MS = 3000;

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
    const store = usePeersStore.getState();
    const existing = store.targetPeers.find((p) => p.peerId === conn.peer);
    if (existing?.connection === conn) {
      store.removeTargetPeer(conn.peer);
    }
  });

  conn.on("error", () => {
    cancelTransfersForPeer(conn.peer);
    if (conn.open) conn.close();
    const store = usePeersStore.getState();
    const existing = store.targetPeers.find((p) => p.peerId === conn.peer);
    if (existing?.connection === conn) {
      store.removeTargetPeer(conn.peer);
    }
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
  const [peerGeneration, setPeerGeneration] = useState(0);
  const reconnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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

      if (reconnectingRef.current) {
        reconnectingRef.current = false;
        notify.dismiss(RECONNECT_TOAST_ID);
        notify.success("Reconnecté");
      }
    });

    newPeer.on("error", (err) => {
      console.error("[PeerProvider] Error:", err);

      if (err.type === "disconnected" || err.type === "network") {
        if (!reconnectingRef.current) {
          reconnectingRef.current = true;
          notify.info("Reconnexion...", false, RECONNECT_TOAST_ID);
        }

        if (newPeer.destroyed) {
          setPeerGeneration((g) => g + 1);
        } else if (newPeer.disconnected) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            attemptPeerReconnect(newPeer);
          }, RECONNECT_DELAY_MS);
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
      if (!reconnectingRef.current) {
        reconnectingRef.current = true;
        notify.info("Reconnexion...", false, RECONNECT_TOAST_ID);
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        attemptPeerReconnect(newPeer);
      }, RECONNECT_DELAY_MS);
    });

    newPeer.on("connection", (conn: DataConnection) => {
      if (!conn) return;
      setupConnectionListeners(conn);
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
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
    if (!localPeerInstance || isPeerDisconnected) return;

    targetPeers.forEach((peer) => {
      if (!peer.connection && localPeerInstance.id !== peer.peerId) {
        const conn = localPeerInstance.connect(peer.peerId, { reliable: true });

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
