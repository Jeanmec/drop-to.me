"use client";
import { Suspense } from "react";
import Hero from "@/components/LandingPage/Hero";
import FileTransfer from "@/components/Forms/FileTransfer/FileTransfer";
import Alone from "@/components/Clients/Alone";
import Disconnected from "@/components/Clients/Disconnected";
import LoadingPage from "@/components/loaders/LoadingPage";
import { usePeersStore } from "@/stores/usePeersStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSocket } from "@/contexts/SocketProvider";
import { useMinimumDuration } from "@/hooks/useMinimumDuration";
import { Chat } from "@/components/Forms/Chat/Chat";
import Statistics from "@/components/Statistic/Statistics";
import Informations from "@/components/Informations";
import { RoomControls } from "@/components/Room/RoomControls";
import { RoomUrlSync } from "@/components/Room/RoomUrlSync";

const MINIMUM_JOINING_DISPLAY = 2000;

export default function HomePage() {
  const { targetPeers, isPeerDisconnected } = usePeersStore();
  const { isRoomJoined, isJoining } = useSocket();
  // FileTransfer is keyed by room so a file picked for the previous room is dropped.
  const roomCode = useRoomStore((s) => s.roomCode);
  const showJoining = useMinimumDuration(isJoining, MINIMUM_JOINING_DISPLAY);
  const hasTargetPeers = targetPeers.length > 0;
  const showContent = isRoomJoined && hasTargetPeers;

  return (
    <>
      {showJoining && <LoadingPage />}
      <main className="relative flex min-h-screen flex-col items-center px-4 pt-8 pb-24 text-white md:pt-12">
        <Suspense fallback={null}>
          <RoomUrlSync />
        </Suspense>
        <Hero />
        <div className="fixed bottom-4 left-4 z-40">
          <RoomControls />
        </div>
        {isPeerDisconnected ? (
          <Disconnected />
        ) : (
          <>
            <Chat />
            {!showContent && <Alone />}
            <FileTransfer key={roomCode ?? "default"} isActive={showContent} />
          </>
        )}
      </main>
      <div className="w-full">
        <Statistics />
        <Informations />
      </div>
    </>
  );
}
