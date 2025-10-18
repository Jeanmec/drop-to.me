"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { usePeer } from "@/contexts/PeerProvider";
import LoadingPage from "@/components/loaders/LoadingPage";

interface ConnectionContextValue {
  isReady: boolean;
  peerId: string | undefined;
}

const ConnectionContext = createContext<ConnectionContextValue>({
  isReady: false,
  peerId: undefined,
});

const MINIMUM_LOADING_TIME = 2500;

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { isRoomJoined } = useSocket();
  const { peer } = usePeer();
  const peerId = peer?.id;

  const [isReady, setIsReady] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const allReady = !!peerId && isRoomJoined;

    if (!allReady) return;

    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsed);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, remainingTime);

    return () => {
      clearTimeout(timer);
    };
  }, [peerId, isRoomJoined, startTime]);

  return (
    <ConnectionContext.Provider value={{ isReady, peerId }}>
      {!isReady ? <LoadingPage /> : children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
