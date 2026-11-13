"use client";

import type { ReactNode } from "react";
import { useIsStranded } from "@/hooks/useIsStranded";
import { cn } from "@/library/utils";
import { usePeersStore } from "@/stores/usePeersStore";
import type { TBeamState, TScenePhase } from "@/types/scene.t";
import BoatFleet from "./BoatFleet";
import IpPlaque from "./IpPlaque";
import Isle from "./Isle";
import LampHalo from "./LampHalo";
import LighthouseBeam from "./LighthouseBeam";
import NightSky from "./NightSky";
import Sea from "./Sea";
import styles from "./Scene.module.css";

interface LighthouseSceneProps {
  children: ReactNode;
  phase: TScenePhase;
}

const beamOf = (isCutOff: boolean, isSending: boolean): TBeamState => {
  if (isCutOff) {
    return "dark";
  }
  return isSending ? "held" : "sweeping";
};

const phaseClass = (phase: TScenePhase): string => {
  switch (phase) {
    case "sketched":
      return `${styles.pencil} ${styles.drawing}`;
    case "washed":
      return styles.pencil;
    case "painted":
      return "";
  }
};

export default function LighthouseScene({
  children,
  phase,
}: LighthouseSceneProps) {
  const isDisconnected = usePeersStore((state) => state.isPeerDisconnected);
  const isStranded = useIsStranded();
  const isSending = usePeersStore((state) =>
    state.targetPeers.some((peer) => peer.isSending),
  );
  const beam = beamOf(isDisconnected || isStranded, isSending);
  const isLit = beam !== "dark";
  const isPainted = phase === "painted";

  return (
    <div className={cn(styles.scene, phaseClass(phase))}>
      <NightSky isLit={isLit} />
      <LighthouseBeam beam={beam} />
      <Sea beam={beam} />
      {isPainted && <BoatFleet />}
      <Isle isLit={isLit} />
      {isPainted && isLit && <span className={styles.ignition} aria-hidden />}
      <LampHalo beam={beam} />
      <span
        className={cn(
          "bg-scrim pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out",
          (isLit || !isPainted) && "opacity-0",
        )}
        aria-hidden
      />
      <IpPlaque />
      {children}
    </div>
  );
}
