"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { useIsStranded } from "@/hooks/useIsStranded";
import { useSessionStore } from "@/stores/useSessionStore";
import { selectIsBeamHeld, useTransferStore } from "@/stores/useTransferStore";
import { BeamState, ScenePhase } from "@/types/scene.t";
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
  phase: ScenePhase;
}

const beamOf = (isCutOff: boolean, isHeld: boolean): BeamState => {
  if (isCutOff) {
    return BeamState.DARK;
  }
  return isHeld ? BeamState.HELD : BeamState.SWEEPING;
};

const phaseClass = (phase: ScenePhase): string | undefined => {
  switch (phase) {
    case ScenePhase.SKETCHED:
      return clsx(styles.pencil, styles.drawing);
    case ScenePhase.WASHED:
      return styles.pencil;
    case ScenePhase.PAINTED:
      return undefined;
  }
};

export default function LighthouseScene({
  children,
  phase,
}: LighthouseSceneProps) {
  const isWebRtcUnsupported = useSessionStore(
    (state) => state.isWebRtcUnsupported,
  );
  const isStranded = useIsStranded();
  const isBeamHeld = useTransferStore(selectIsBeamHeld);
  const beam = beamOf(isWebRtcUnsupported || isStranded, isBeamHeld);
  const isLit = beam !== BeamState.DARK;
  const isPainted = phase === ScenePhase.PAINTED;

  return (
    <div className={clsx(styles.scene, phaseClass(phase))}>
      <NightSky isLit={isLit} />
      <LighthouseBeam beam={beam} />
      <Sea beam={beam} />
      {isPainted && <BoatFleet isBeamHeld={isBeamHeld} />}
      <Isle isLit={isLit} />
      {isPainted && isLit && <span className={styles.ignition} aria-hidden />}
      <LampHalo beam={beam} />
      <span
        className={clsx(
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
