"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePeer } from "@/contexts/PeerProvider";
import LoadingPage from "@/components/loaders/LoadingPage";

interface ConnectionContextValue {
  isReady: boolean;
  peerId: string | undefined;
  hasTimedOut: boolean;
}

const ConnectionContext = createContext<ConnectionContextValue>({
  isReady: false,
  peerId: undefined,
  hasTimedOut: false,
});

const MINIMUM_LOADING_TIME = 2500;
const CONNECTION_TIMEOUT = 15_000;

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { peer } = usePeer();
  const peerId = peer?.id;

  const [isReady, setIsReady] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (peerId) return;

    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, CONNECTION_TIMEOUT);

    return () => clearTimeout(timer);
  }, [peerId]);

  useEffect(() => {
    if (!peerId) return;

    setHasTimedOut(false);
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsed);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, remainingTime);

    return () => {
      clearTimeout(timer);
    };
  }, [peerId, startTime]);

  return (
    <ConnectionContext.Provider value={{ isReady, peerId, hasTimedOut }}>
      {!isReady ? <LoadingPage timedOut={hasTimedOut} /> : children}
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
