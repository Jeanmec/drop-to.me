"use client";
import { usePeer } from "~/contexts/PeerProvider";
import { useLoadingStore } from "./stores/useLoadingStore";
import { useSocket } from "~/contexts/SocketProvider";
import { useEffect } from "react";

export default function HomePage() {
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const { peer } = usePeer();
  const { socketId } = useSocket();

  useEffect(() => {
    console.log("Socket ID:", socketId);
    if (!socketId || !peer) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [peer, socketId, startLoading, stopLoading]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="badge badge-accent">Accent</div>
      <h1 className="text-5xl font-bold">
        {isLoading ? "Loading..." : "Welcome"}
      </h1>
    </main>
  );
}
