"use client";

import Chat from "@/components/Forms/Chat/Chat";
import FileTransfer from "@/components/Forms/FileTransfer/FileTransfer";
import Informations from "@/components/Informations";
import Hero from "@/components/LandingPage/Hero";
import EnteringRoomNote from "@/components/Room/EnteringRoomNote";
import RoomControls from "@/components/Room/RoomControls";
import LighthouseScene from "@/components/Scene/LighthouseScene";
import Disconnected from "@/components/Session/Disconnected";
import Statistics from "@/components/Statistics/Statistics";
import AnimationTimer from "@/components/ui/AnimationTimer";
import { useIsFileDragged } from "@/hooks/useIsFileDragged";
import { useIsStranded } from "@/hooks/useIsStranded";
import { useJoiningWash } from "@/hooks/useJoiningWash";
import { usePeersStore } from "@/stores/usePeersStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { ScenePhase } from "@/types/scene.t";

export default function HomePage() {
  const hasTargetPeers = usePeersStore((state) => state.targetPeers.length > 0);
  const isBrowserUnsupported = useSessionStore(
    (state) => state.isBrowserUnsupported,
  );
  const isFileDragged = useIsFileDragged();
  const roomCode = useRoomStore((state) => state.roomCode);
  const isRoomJoined = useSessionStore((state) => state.isRoomJoined);
  const isJoining = useSessionStore((state) => state.isJoining);
  const isStranded = useIsStranded();
  const wash = useJoiningWash(isJoining);

  const isCutOff = isBrowserUnsupported || isStranded;
  const isWashed = wash.isWashed && !isCutOff;
  const phase = isWashed ? ScenePhase.WASHED : ScenePhase.PAINTED;
  const isActive = isRoomJoined && hasTargetPeers && !isStranded;
  const isDropTarget = isFileDragged && isActive;

  return (
    <>
      <main>
        <LighthouseScene phase={phase}>
          <Hero
            phase={phase}
            note={
              isWashed && roomCode && <EnteringRoomNote roomCode={roomCode} />
            }
          >
            {isBrowserUnsupported ? (
              <Disconnected />
            ) : (
              <FileTransfer
                isActive={isActive}
                isDropTarget={isDropTarget}
                isConnecting={isStranded}
              />
            )}
          </Hero>
          <RoomControls />
          {!isBrowserUnsupported && (
            <Chat isBuoyStowed={isWashed || isDropTarget} />
          )}
        </LighthouseScene>
        {wash.isHeld && (
          <AnimationTimer
            key={roomCode}
            className="animate-wash"
            onElapsed={wash.release}
          />
        )}
      </main>
      <Statistics />
      <Informations />
    </>
  );
}
