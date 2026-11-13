"use client";
import { Suspense } from "react";
import Hero from "@/components/LandingPage/Hero";
import FileTransfer from "@/components/Forms/FileTransfer/FileTransfer";
import Disconnected from "@/components/Clients/Disconnected";
import LighthouseScene from "@/components/Scene/LighthouseScene";
import { usePeersStore } from "@/stores/usePeersStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSocket } from "@/contexts/SocketProvider";
import { useIsStranded } from "@/hooks/useIsStranded";
import { useMinimumDuration } from "@/hooks/useMinimumDuration";
import { Chat } from "@/components/Forms/Chat/Chat";
import Statistics from "@/components/Statistic/Statistics";
import Informations from "@/components/Informations";
import { EnteringRoomNote } from "@/components/Room/EnteringRoomNote";
import { RoomControls } from "@/components/Room/RoomControls";
import { RoomUrlSync } from "@/components/Room/RoomUrlSync";
import type { TScenePhase } from "@/types/scene.t";

const MINIMUM_JOINING_DISPLAY = 2000;

export default function HomePage() {
  const { targetPeers, isPeerDisconnected } = usePeersStore();
  const { isRoomJoined, isJoining } = useSocket();
  const isStranded = useIsStranded();
  // FileTransfer is keyed by room so a file picked for the previous room is dropped.
  const roomCode = useRoomStore((s) => s.roomCode);
  const showJoining = useMinimumDuration(isJoining, MINIMUM_JOINING_DISPLAY);
  const isCutOff = isPeerDisconnected || isStranded;
  const phase: TScenePhase = showJoining && !isCutOff ? "washed" : "painted";
  const hasTargetPeers = targetPeers.length > 0;
  const showContent = isRoomJoined && hasTargetPeers && !isStranded;

  return (
    <>
      <main>
        <Suspense fallback={null}>
          <RoomUrlSync />
        </Suspense>
        <LighthouseScene phase={phase}>
          <Hero
            phase={phase}
            note={
              phase === "washed" &&
              roomCode && <EnteringRoomNote roomCode={roomCode} />
            }
          >
            {isPeerDisconnected ? (
              <Disconnected />
            ) : (
              <FileTransfer
                key={roomCode ?? "default"}
                isActive={showContent}
                isConnecting={isStranded}
              />
            )}
          </Hero>
          <RoomControls />
          {!isPeerDisconnected && <Chat isBuoyStowed={phase === "washed"} />}
        </LighthouseScene>
      </main>
      <Statistics />
      <Informations />
    </>
  );
}
