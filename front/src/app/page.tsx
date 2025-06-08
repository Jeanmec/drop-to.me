"use client";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useSocket } from "@/contexts/SocketProvider";
import { useCallback, useContext, useEffect } from "react";
import { onSocket } from "@/services/socketService";
import { roomService } from "@/services/roomService";
import { usePeersStore } from "@/stores/usePeersStore";
import ParticleLoader from "@/components/loader/ParticleLoader";
import Hero from "@/components/LandingPage/Hero";
import { PeerContext } from "@/contexts/PeerProvider";
import ConcentricCirclesBackground from "@/components/styles/background";
import FormsControl from "@/components/Forms/FormsControl";

export default function HomePage() {
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const { addTargetPeer, removeTargetPeer } = usePeersStore();
  const { socketId, socket } = useSocket();
  const peerInstance = useContext(PeerContext);

  const peerId = peerInstance?.id;

  const joinRoom = useCallback(async () => {
    if (socketId && peerId) {
      try {
        const res = await roomService.joinRoom(peerId, socketId);
        if (res && Array.isArray(res.peers)) {
          res.peers.forEach((peer: string) => {
            if (peer !== peerId) {
              addTargetPeer({ peerId: peer });
            }
          });
        }
        console.log("Room joined successfully:", res);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    } else {
      console.log("Waiting for socketId and peerId to be defined");
    }
  }, [socketId, peerId, addTargetPeer]);

  const initListenersSocket = useCallback(() => {
    if (!socket || !peerId) return;

    onSocket("peer-joined", (peer: string) => {
      if (peer !== peerId) {
        console.log(`Un nouveau peer a rejoint : ${peer}`);
        addTargetPeer({ peerId: peer });
      }
    });

    onSocket("peer-left", (peer: string) => {
      console.log(`Un peer est parti : ${peer}`);
      removeTargetPeer(peer);
    });
  }, [addTargetPeer, removeTargetPeer, socket, peerId]);

  useEffect(() => {
    if (!socketId || !peerId) {
      startLoading();
    } else {
      stopLoading();
      void joinRoom();
      initListenersSocket();
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
    <>
      <ConcentricCirclesBackground />
      <main className="relative flex min-h-screen flex-col text-white">
        <Hero />
        {isLoading ? <ParticleLoader /> : <FormsControl />}
      </main>
    </>
  );
}
