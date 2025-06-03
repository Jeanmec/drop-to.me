"use client";
import { usePeer } from "@/contexts/PeerProvider";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useSocket } from "@/contexts/SocketProvider";
import { useCallback, useEffect } from "react";
import { onSocket } from "@/services/socketService";
import { roomService } from "@/services/roomService";
import { usePeersStore } from "@/stores/usePeersStore";
import ParticleLoader from "@/components/loader/ParticleLoader";
import FormsControl from "@/components/Forms/FormsControl";
import ActiveClients from "@/components/Clients/ActiveClients";

export default function HomePage() {
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const { peerId } = usePeer();
  const { socketId, socket } = useSocket();
  const { addPeer, removePeer, Peers } = usePeersStore();

  const joinRoom = useCallback(async () => {
    if (socketId && peerId) {
      try {
        const res = await roomService.joinRoom(peerId, socketId);
        if (res && Array.isArray(res.peers) && res.peers.length > 0) {
          res.peers.forEach((peer: string) => {
            addPeer(peer);
          });
        }
        console.log("Room joined successfully:", res);
        console.log("Joined room successfully");
      } catch (error) {
        console.error("Error joining room:", error);
      }
    }
  }, [socketId, peerId, addPeer]);

  const initListenersSocket = useCallback(() => {
    if (!socket) return;
    onSocket("peer-joined", (peer: string) => {
      addPeer(peer);
      // if (!connectionsRef.current[peerId]) {
      //   connectToPeer(peerId);
      // }
    });
    onSocket("peer-left", (peer: string) => {
      removePeer(peer);
    });
  }, [addPeer, removePeer, socket]);

  useEffect(() => {
    console.log("Peer ID:", peerId);
    console.log("Socket ID:", socketId);
    if (!socketId || !peerId) {
      startLoading();
    } else {
      stopLoading();

      void joinRoom();
      void initListenersSocket();
    }
  }, [
    initListenersSocket,
    joinRoom,
    peerId,
    socketId,
    startLoading,
    stopLoading,
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-5xl font-bold">
        {isLoading ? <ParticleLoader /> : "Welcome"}
      </h1>
      <div className="flex flex-col gap-6">
        <pre>My peer ID : {peerId}</pre>
        <pre>My socket ID : {socketId}</pre>
        {Peers && Peers.length > 0 && (
          <div className="flex flex-col gap-2">
            {Peers.map((peer) => (
              <div className="badge badge-soft badge-info p-3" key={peer}>
                {peer}
              </div>
            ))}
          </div>
        )}
      </div>

      <FormsControl />

      <ActiveClients />
    </main>
  );
}
