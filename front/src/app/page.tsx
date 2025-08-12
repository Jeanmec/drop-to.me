"use client";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useSocket } from "@/contexts/SocketProvider";
import { useCallback, useContext, useEffect } from "react";
import { onSocket } from "@/services/socketService";
import { roomService } from "@/services/roomService";
import { usePeersStore } from "@/stores/usePeersStore";
import Hero from "@/components/LandingPage/Hero";
import { PeerContext } from "@/contexts/PeerProvider";
import FormsControl from "@/components/Forms/FormsControl";
import Informations from "@/components/Informations";
import BackgroundController from "@/components/Background/BackgroundController";
import Statistics from "@/components/Statistic/Statistics";
import Alone from "@/components/Clients/Alone";

export default function HomePage() {
  const { isLoading, startLoading, stopLoading } = useLoadingStore();
  const {
    addTargetPeer,
    removeTargetPeer,
    targetPeers,
    globalPeersState,
    setGlobalPeersState,
  } = usePeersStore();
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
        addTargetPeer({ peerId: peer });
      }
    });

    onSocket("peer-left", (peer: string) => {
      removeTargetPeer(peer);
    });
  }, [addTargetPeer, removeTargetPeer, socket, peerId]);

  useEffect(() => {
    if (!targetPeers || targetPeers.length === 0) {
      setGlobalPeersState("disconnected");
      return;
    }
    targetPeers.forEach((peer) => {
      if (
        peer.state === "open" ||
        peer.state === "sending" ||
        peer.state === "delivered"
      ) {
        setGlobalPeersState("connected");
      } else {
        setGlobalPeersState("disconnected");
      }
    });
  }, [setGlobalPeersState, targetPeers]);

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
      <BackgroundController />
      <main className="relative flex min-h-screen flex-col items-center px-4 pt-12 pb-24 text-white">
        <Hero />
        {isLoading || globalPeersState === "disconnected" ? (
          <Alone />
        ) : (
          <FormsControl />
        )}
      </main>
      <div className="w-full">
        {/* <ActiveClients /> */}
        <Statistics />
        <Informations />
      </div>
    </>
  );
}
